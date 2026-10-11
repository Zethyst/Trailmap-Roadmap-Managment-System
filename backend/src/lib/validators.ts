import { z } from 'zod'

export const nodeTypeSchema = z.enum(['step', 'milestone', 'group', 'note'])
export const visibilitySchema = z.enum(['private', 'unlisted', 'public'])

export const createRoadmapSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
})

export const updateRoadmapSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  visibility: visibilitySchema.optional(),
  coverUrl: z.string().url().nullable().optional(),
})

const graphNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  parentId: z.string().nullable().optional(),
  data: z.unknown(),
})

const graphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().nullable().optional(),
  style: z.unknown().optional(),
})

export const graphSchema = z.object({
  nodes: z.array(graphNodeSchema).max(2000),
  edges: z.array(graphEdgeSchema).max(5000),
})

export type GraphInput = z.infer<typeof graphSchema>

export const progressSchema = z.object({
  roadmapId: z.string().min(1),
  nodeId: z.string().min(1),
  status: z.enum(['todo', 'in_progress', 'done']),
})

export const aiGenerateSchema = z.object({
  goal: z.string().trim().min(3).max(300),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeBudget: z.string().max(100).optional(),
})

export type AiGenerateInput = z.infer<typeof aiGenerateSchema>

/** Local→cloud migration payload: a batch of locally-stored roadmaps. */
export const importSchema = z.object({
  roadmaps: z
    .array(
      z.object({
        localId: z.string().min(1),
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().max(2000).optional(),
        nodes: z.array(graphNodeSchema).max(2000),
        edges: z.array(graphEdgeSchema).max(5000),
      }),
    )
    .min(1)
    .max(50),
})
