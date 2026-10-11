'use client'

import type { VideoBlock } from '@/types'
import { Trash2 } from 'lucide-react'

interface Props {
  block: VideoBlock
  onDelete: () => void
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com')) {
      id = u.searchParams.get('v')
    }
    return id ? `https://www.youtube.com/embed/${id}` : null //Here embed url is being returned for the youtube video to play the yt video
  } catch {
    return null
  }
}

export function VideoBlockComponent({ block, onDelete }: Props) {
  const embedUrl = youtubeEmbedUrl(block.url)

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group relative">
      {embedUrl ? (
        <iframe //dusri website ka content ko apni website mei show karne ke liye iframe ka use hota hai
          src={embedUrl}
          title={block.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 text-sm text-gray-500">
          {block.title || block.url}
        </div>
      )}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-900 rounded p-1 text-gray-400 hover:text-red-500 transition-opacity shadow"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
