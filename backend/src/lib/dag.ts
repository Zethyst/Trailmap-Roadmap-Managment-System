/** Returns true if the directed edge set contains a cycle. Iterative DFS. */
export function hasCycle(edges: { source: string; target: string }[]): boolean {
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
  }

  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map<string, number>()
  for (const node of adj.keys()) color.set(node, WHITE)
  for (const list of adj.values()) for (const n of list) if (!color.has(n)) color.set(n, WHITE)

  // Iterative DFS with an explicit stack; GRAY marks nodes on the current path.
  for (const start of color.keys()) {
    if (color.get(start) !== WHITE) continue
    const stack: { node: string; i: number }[] = [{ node: start, i: 0 }]
    color.set(start, GRAY)
    while (stack.length) {
      const frame = stack[stack.length - 1]
      const neighbors = adj.get(frame.node) ?? []
      if (frame.i < neighbors.length) {
        const next = neighbors[frame.i++]
        const c = color.get(next)
        if (c === GRAY) return true
        if (c === WHITE) {
          color.set(next, GRAY)
          stack.push({ node: next, i: 0 })
        }
      } else {
        color.set(frame.node, BLACK)
        stack.pop()
      }
    }
  }
  return false
}
