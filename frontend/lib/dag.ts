import type { CanvasEdge } from '@/types'

export function wouldCreateCycle(
  edges: CanvasEdge[],
  source: string,
  target: string,
): boolean {
  if (source === target) return true

  const adj = new Map<string, string[]>()
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
  }

  // Iterative DFS from target — if we can reach source, adding source→target makes a cycle
  const visited = new Set<string>()
  const stack = [target]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (node === source) return true
    if (visited.has(node)) continue
    visited.add(node)
    for (const neighbor of adj.get(node) ?? []) {
      stack.push(neighbor)
    }
  }
  return false
}
