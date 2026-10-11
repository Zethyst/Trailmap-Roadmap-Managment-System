import Dexie, { type Table } from 'dexie'
import type { LocalRoadmap } from '@/types'

interface LocalBlob {
  id: string
  roadmapId: string
  blob: Blob
}

class TrailmapDB extends Dexie {
  roadmaps!: Table<LocalRoadmap>
  blobs!: Table<LocalBlob>

  // So super('trailmap') is calling Dexie's own constructor, passing 'trailmap' as the database name. This tells Dexie: "create (or open) an IndexedDB database literally named trailmap" — this is the actual database file/namespace in the browser, separate from the roadmaps table name we discussed earlier.
  constructor() {
    super('trailmap')
    this.version(1).stores({
      roadmaps: 'id, updatedAt',
    })
    this.version(2).stores({
      roadmaps: 'id, updatedAt',
      blobs: 'id, roadmapId',
    })
  }
}

export const db = new TrailmapDB()

export async function saveRoadmap(roadmap: LocalRoadmap) {
  await db.roadmaps.put(roadmap)
}

export async function getRoadmap(id: string): Promise<LocalRoadmap | undefined> {
  return db.roadmaps.get(id)
}

export async function listRoadmaps(): Promise<LocalRoadmap[]> {
  return db.roadmaps.orderBy('updatedAt').reverse().toArray()
}

export async function deleteRoadmap(id: string) {
  await db.roadmaps.delete(id)
}

export async function deleteBlobsByRoadmap(roadmapId: string) {
  await db.blobs.where('roadmapId').equals(roadmapId).delete()
}
