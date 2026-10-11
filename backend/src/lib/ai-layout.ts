import type { AiRoadmap } from '../services/ai'

const STEP_COLORS = ['blue', 'green', 'purple', 'orange', 'pink']
const X_GAP = 280
const Y_GAP = 190

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Turns the AI's abstract graph into canvas-ready nodes/edges.
 * Positions come from a simple layered (longest-path) layout so prerequisites
 * flow top→bottom; the user can rearrange afterwards.
 */
export function layoutAiRoadmap(ai: AiRoadmap) {
  const ids = ai.nodes.map((n) => n.id)
  const idSet = new Set(ids)
  const edges = ai.edges.filter((e) => idSet.has(e.source) && idSet.has(e.target))

  // Longest-path layering: depth = max incoming chain length.
  const depth = new Map<string, number>(ids.map((id) => [id, 0]))
  const adj = new Map<string, string[]>()
  const indeg = new Map<string, number>(ids.map((id) => [id, 0]))
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1)
  }
  const queue = ids.filter((id) => (indeg.get(id) ?? 0) === 0)
  while (queue.length) {
    const u = queue.shift()!
    for (const v of adj.get(u) ?? []) {
      depth.set(v, Math.max(depth.get(v) ?? 0, (depth.get(u) ?? 0) + 1))
      indeg.set(v, (indeg.get(v) ?? 0) - 1)
      if ((indeg.get(v) ?? 0) === 0) queue.push(v)
    }
  }

  // Assign an x-slot per node within its layer.
  const perLayer = new Map<number, number>()
  let stepColor = 0

  const nodes = ai.nodes.map((n) => {
    const d = depth.get(n.id) ?? 0
    const slot = perLayer.get(d) ?? 0
    perLayer.set(d, slot + 1)

    const blocks = n.description
      ? [{ id: crypto.randomUUID(), type: 'text', html: `<p>${escapeHtml(n.description)}</p>` }]
      : []

    return {
      id: n.id,
      type: n.type,
      position: { x: slot * X_GAP, y: d * Y_GAP },
      data: {
        title: n.title,
        blocks,
        ...(n.estMinutes ? { estMinutes: n.estMinutes } : {}),
        ...(n.type === 'step' ? { color: STEP_COLORS[stepColor++ % STEP_COLORS.length] } : {}),
      },
    }
  })

  const outEdges = edges.map((e) => ({
    id: `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
  }))

  return { nodes, edges: outEdges }
}
