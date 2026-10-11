'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import {
  Plus, MoreVertical, Copy, Trash2, Pencil, Globe, Lock, Link2, X, Loader2,
  Play, MapPin, StickyNote, Trophy, Boxes, Map, CheckCircle2, Activity,
} from 'lucide-react'
import {
  useRoadmaps,
  useCreateRoadmap,
  useDeleteRoadmap,
  useDuplicateRoadmap,
  useUpdateRoadmap,
} from '@/hooks/use-roadmaps'
import type { RoadmapSummary, Visibility } from '@/lib/api-client'
import { UserMenu } from '@/components/auth/UserMenu'
import { CircularProgress } from './CircularProgress'

const VIS_META: Record<Visibility, { icon: typeof Lock; label: string }> = {
  private: { icon: Lock, label: 'Private' },
  unlisted: { icon: Link2, label: 'Unlisted' },
  public: { icon: Globe, label: 'Public' },
}

export function DashboardClient() {
  const { data: roadmaps, isLoading, isError } = useRoadmaps()
  const [creating, setCreating] = useState(false)

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your roadmaps</h1>
          <p className="text-sm text-white/50">Build, organise and share your learning paths</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
          >
            <Plus size={16} />
            New roadmap
          </button>
          <UserMenu />
        </div>
      </header>

      {roadmaps && roadmaps.length > 0 && <StatsBar roadmaps={roadmaps} />}

      {isLoading && <p className="text-white/50">Loading…</p>}
      {isError && <p className="text-red-400">Couldn’t load your roadmaps.</p>}

      {roadmaps && roadmaps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-white/60">No roadmaps yet.</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            <Plus size={16} /> Create your first roadmap
          </button>
        </div>
      )}

      {roadmaps && roadmaps.length > 0 && (
        <div className="space-y-3">
          {roadmaps.map((r) => (
            <RoadmapRow key={r.id} roadmap={r} />
          ))}
        </div>
      )}

      {creating && <CreateRoadmapModal onClose={() => setCreating(false)} />}
    </main>
  )
}

function StatsBar({ roadmaps }: { roadmaps: RoadmapSummary[] }) {
  const total = roadmaps.length
  const isComplete = (r: RoadmapSummary) => (r.totalSteps ?? 0) > 0 && (r.doneSteps ?? 0) >= (r.totalSteps ?? 0)
  const isStarted = (r: RoadmapSummary) => (r.doneSteps ?? 0) > 0 && !isComplete(r)
  const completed = roadmaps.filter(isComplete).length
  const inProgress = roadmaps.filter(isStarted).length

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      <StatCard icon={Map} label="Roadmaps created" value={total} />
      <StatCard icon={CheckCircle2} label="Completed" value={completed} accent />
      <StatCard icon={Activity} label="In progress" value={inProgress} />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Map
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <Icon size={14} className={accent ? 'text-emerald-400' : 'text-white/40'} />
        {label}
      </div>
      <p className={`mt-1 text-2xl font-bold ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function CreateRoadmapModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const createRoadmap = useCreateRoadmap()
  const [name, setName] = useState('')

  async function create() {
    const title = name.trim()
    if (!title) return
    const created = await createRoadmap.mutateAsync(title)
    router.push(`/roadmap/${created.id}`)
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-white">Name your roadmap</h3>
          <button onClick={onClose} className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') create()
              if (e.key === 'Escape') onClose()
            }}
            placeholder="e.g. Become a full-stack developer"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5">
              Cancel
            </button>
            <button
              onClick={create}
              disabled={!name.trim() || createRoadmap.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createRoadmap.isPending && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Stat({ icon: Icon, count, label }: { icon: typeof MapPin; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-white/55">
      <Icon size={14} className="text-white/35" />
      {count} {label}
    </span>
  )
}

function RoadmapRow({ roadmap }: { roadmap: RoadmapSummary }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(roadmap.title)

  const del = useDeleteRoadmap()
  const dup = useDuplicateRoadmap()
  const update = useUpdateRoadmap()

  const Vis = VIS_META[roadmap.visibility]
  const c = roadmap.counts ?? { step: 0, milestone: 0, note: 0, group: 0 }
  const total = roadmap.totalSteps ?? 0
  const done = roadmap.doneSteps ?? 0
  const pct = total > 0 ? (done / total) * 100 : 0
  const resumeLabel = pct >= 100 ? 'Review' : done > 0 ? 'Resume' : 'Open'

  function commitRename() {
    const next = title.trim()
    setRenaming(false)
    if (next && next !== roadmap.title) update.mutate({ id: roadmap.id, patch: { title: next } })
    else setTitle(roadmap.title)
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20">
      {/* Play / open */}
      <Link
        href={`/roadmap/${roadmap.id}`}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-emerald-400 transition-colors hover:bg-emerald-500/15"
        aria-label="Open roadmap"
      >
        <Play size={22} className="ml-0.5" fill="currentColor" />
      </Link>

      {/* Title + stats */}
      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setTitle(roadmap.title); setRenaming(false) }
            }}
            className="w-full max-w-sm rounded-md border border-white/20 bg-white/10 px-2 py-1 text-base font-semibold text-white focus:outline-none"
          />
        ) : (
          <Link href={`/roadmap/${roadmap.id}`} className="block">
            <h3 className="truncate text-base font-semibold text-white">{roadmap.title}</h3>
          </Link>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1">
          <Stat icon={MapPin} count={c.step} label={c.step === 1 ? 'Step' : 'Steps'} />
          <Stat icon={StickyNote} count={c.note} label={c.note === 1 ? 'Note' : 'Notes'} />
          {c.milestone > 0 && (
            <Stat icon={Trophy} count={c.milestone} label={c.milestone === 1 ? 'Milestone' : 'Milestones'} />
          )}
          {c.group > 0 && (
            <Stat icon={Boxes} count={c.group} label={c.group === 1 ? 'Section' : 'Sections'} />
          )}
          <span className="inline-flex items-center gap-1 text-xs text-white/35">
            <Vis.icon size={11} /> {Vis.label}
          </span>
        </div>
      </div>

      {/* Progress + resume */}
      <div className="flex shrink-0 items-center gap-4">
        <CircularProgress value={pct} size={56} />
        <Link
          href={`/roadmap/${roadmap.id}`}
          className="rounded-lg border border-emerald-500/40 px-5 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10"
        >
          {resumeLabel}
        </Link>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-1 text-white/30 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
            aria-label="Roadmap actions"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
                <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); setRenaming(true) }} />
                <MenuItem icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); dup.mutate(roadmap) }} />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  destructive
                  onClick={() => {
                    setMenuOpen(false)
                    if (confirm(`Delete “${roadmap.title}”? This cannot be undone.`)) del.mutate(roadmap.id)
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
        destructive ? 'text-red-400' : 'text-white/80'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
