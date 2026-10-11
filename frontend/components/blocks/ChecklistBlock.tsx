'use client'

import { useState } from 'react'
import type { ChecklistBlock, ChecklistItem } from '@/types'
import { Trash2, Plus } from 'lucide-react'

interface Props {
  block: ChecklistBlock
  onChange: (block: ChecklistBlock) => void
}

export function ChecklistBlockComponent({ block, onChange }: Props) {
  const [newText, setNewText] = useState('')

  function toggleItem(id: string) {
    onChange({
      ...block,
      items: block.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    })
  }

  function deleteItem(id: string) {
    onChange({ ...block, items: block.items.filter((i) => i.id !== id) })
  }

  function addItem() {
    if (!newText.trim()) return
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      done: false,
    }
    onChange({ ...block, items: [...block.items, item] })
    setNewText('')
  }

  return (
    <div className="space-y-1.5">
      {block.items.map((item) => (
        <div key={item.id} className="group flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggleItem(item.id)}
            className="h-3.5 w-3.5 shrink-0 rounded accent-blue-600"
          />
          <span
            className={`flex-1 min-w-0 truncate text-[13px] ${item.done ? 'text-black/35 line-through' : 'text-black/75'}`}
          >
            {item.text}
          </span>
          <button
            onClick={() => deleteItem(item.id)}
            className="shrink-0 text-black/25 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="mt-1.5 flex items-center gap-1.5">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add item…"
          className="h-7 flex-1 rounded-md border border-black/10 bg-white/60 px-2.5 text-[13px] text-black/75 placeholder:text-black/35 focus:border-black/20 focus:bg-white/80 focus:outline-none"
        />
        <button
          onClick={addItem}
          aria-label="Add item"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/5 text-black/50 transition-colors hover:bg-black/10 hover:text-black/75"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
