import { Prisma } from '@prisma/client'
import type { GraphInput } from './validators'

/**
 * Full-graph upsert for a roadmap, inside a transaction. Shared by
 * PATCH /:id/graph and the local→cloud import route.
 *
 * Nodes are reconciled by a diff (not delete-all + recreate) so that nodes which
 * survive a save keep their row — and therefore their NodeProgress FKs stay
 * valid. Only nodes actually removed from the graph are deleted (their progress
 * cascades). Edges have no dependents, so they're fully replaced.
 *
 * Nodes are written in two passes so self-referential `parentId` FKs never
 * reference a not-yet-inserted row.
 */
export async function writeGraphTx(
  tx: Prisma.TransactionClient,
  roadmapId: string,
  nodesInput: GraphInput['nodes'],
  edgesInput: GraphInput['edges'],
) {
  // Dedupe by id — a PK can't repeat, and clients can occasionally send a
  // duplicated node/edge id (e.g. deterministic React Flow edge ids). Keep the
  // last occurrence of each id.
  const nodes = [...new Map(nodesInput.map((n) => [n.id, n])).values()]
  const edges = [...new Map(edgesInput.map((e) => [e.id, e])).values()]

  await tx.edge.deleteMany({ where: { roadmapId } })

  // Delete only nodes that are no longer present (cascades their progress rows).
  const existing = await tx.node.findMany({ where: { roadmapId }, select: { id: true } })
  const incomingIds = new Set(nodes.map((n) => n.id))
  const toDelete = existing.filter((e) => !incomingIds.has(e.id)).map((e) => e.id)
  if (toDelete.length) {
    await tx.node.deleteMany({ where: { id: { in: toDelete } } })
  }

  // Pass 1: upsert each node with parentId null (avoids self-FK ordering issues).
  for (const n of nodes) {
    const fields = {
      type: n.type,
      positionX: n.position.x,
      positionY: n.position.y,
      width: n.width ?? null,
      height: n.height ?? null,
      data: (n.data ?? {}) as Prisma.InputJsonValue,
    }
    await tx.node.upsert({
      where: { id: n.id },
      create: { id: n.id, roadmapId, parentId: null, ...fields },
      update: { roadmapId, parentId: null, ...fields },
    })
  }
  // Pass 2: set parent links now that all rows exist.
  for (const n of nodes) {
    if (n.parentId) {
      await tx.node.update({ where: { id: n.id }, data: { parentId: n.parentId } })
    }
  }

  if (edges.length) {
    // Defensive: clear any pre-existing rows (in any roadmap) that share an
    // incoming edge id, so createMany can't hit a global PK collision.
    await tx.edge.deleteMany({ where: { id: { in: edges.map((e) => e.id) } } })
    await tx.edge.createMany({
      data: edges.map((e) => ({
        id: e.id,
        roadmapId,
        sourceNodeId: e.source,
        targetNodeId: e.target,
        label: e.label ?? null,
        style: (e.style ?? undefined) as Prisma.InputJsonValue | undefined,
      })),
    })
  }
}
