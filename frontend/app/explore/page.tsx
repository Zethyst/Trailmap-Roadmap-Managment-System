import Link from 'next/link'
import type { Metadata } from 'next'
import { Eye, GitFork, MapPin, Search, Trophy } from 'lucide-react'
import { PublicNav } from '@/components/site/PublicNav'
import { listExplore, listExploreTags, type ExploreRoadmap, type ExploreSort } from '@/lib/explore'
import { cn } from '@/lib/utils'

type SearchParams = Promise<{ q?: string; tag?: string; sort?: string; page?: string }>

function parse(sp: Awaited<SearchParams>) {
  const q = sp.q?.trim().slice(0, 100) || undefined
  const tag = sp.tag?.trim().toLowerCase().slice(0, 30) || undefined
  const sort: ExploreSort = sp.sort === 'recent' ? 'recent' : 'popular'
  const page = Math.min(100, Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1))
  return { q, tag, sort, page }
}

/** /explore with the given filters, dropping defaults so URLs stay short. */
function href(p: { q?: string; tag?: string; sort?: ExploreSort; page?: number }) {
  const qs = new URLSearchParams()
  if (p.q) qs.set('q', p.q)
  if (p.tag) qs.set('tag', p.tag)
  if (p.sort && p.sort !== 'popular') qs.set('sort', p.sort)
  if (p.page && p.page > 1) qs.set('page', String(p.page))
  const s = qs.toString()
  return s ? `/explore?${s}` : '/explore'
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, tag } = parse(await searchParams)
  const title = tag ? `${tag} roadmaps` : 'Explore roadmaps'
  const description = tag
    ? `Public learning roadmaps tagged “${tag}” on Trailmap. Follow one step by step, or fork it into your own.`
    : 'Browse public learning roadmaps made by the Trailmap community. Follow one step by step, or fork it into your own.'
  return {
    title,
    description,
    alternates: { canonical: tag ? `/explore?tag=${encodeURIComponent(tag)}` : '/explore' },
    openGraph: { title: `${title} · Trailmap`, description },
    // Search result pages are endless variations of the same content.
    ...(q ? { robots: { index: false, follow: true } } : {}),
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function updatedAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const { q, tag, sort, page } = parse(await searchParams)
  const [list, tags] = await Promise.all([listExplore({ q, tag, sort, page }), listExploreTags()])
  const filtered = Boolean(q || tag)

  return (
    <main className="flex-1 overflow-y-auto bg-[#06130d] text-white">
      <PublicNav />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <header className="tm-fade-up">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore roadmaps</h1>
          <p className="mt-2 max-w-2xl text-white/60">
            Learning paths people have shared. Open one to follow it step by step, or fork it into your own account.
          </p>
        </header>

        {/* Search + sort. A plain GET form, so it works before JavaScript loads. */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action="/explore" className="relative flex-1" role="search">
            {tag && <input type="hidden" name="tag" value={tag} />}
            {sort !== 'popular' && <input type="hidden" name="sort" value={sort} />}
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search roadmaps, e.g. react, spanish, system design"
              aria-label="Search roadmaps"
              maxLength={100}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </form>
          <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm" role="tablist" aria-label="Sort">
            {(['popular', 'recent'] as const).map((s) => (
              <Link
                key={s}
                href={href({ q, tag, sort: s })}
                role="tab"
                aria-selected={sort === s}
                className={cn(
                  'rounded-lg px-3 py-1.5 transition-colors',
                  sort === s ? 'bg-emerald-500/20 font-medium text-emerald-200' : 'text-white/60 hover:text-white',
                )}
              >
                {s === 'popular' ? 'Most viewed' : 'Recently updated'}
              </Link>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        {tags && tags.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by tag">
            <TagChip href={href({ q, sort })} active={!tag} label="All" />
            {tags.tags.map((t) => (
              <TagChip key={t.tag} href={href({ q, sort, tag: t.tag })} active={tag === t.tag} label={`#${t.tag}`} count={t.count} />
            ))}
          </div>
        )}

        {/* Results */}
        {!list ? (
          <p className="mt-12 text-center text-white/60">Couldn’t load roadmaps right now. Please try again in a moment.</p>
        ) : list.roadmaps.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 p-10 text-center">
            {filtered ? (
              <>
                <p className="text-white/70">No public roadmaps match{q ? ` “${q}”` : ''}{tag ? ` in #${tag}` : ''}.</p>
                <Link href="/explore" className="mt-3 inline-block text-sm font-medium text-emerald-300 hover:underline">
                  Clear filters
                </Link>
              </>
            ) : (
              <>
                <p className="text-white/70">No public roadmaps yet.</p>
                <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium text-emerald-300 hover:underline">
                  Be the first: share one of yours
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.roadmaps.map((r, i) => (
                <li key={r.shareSlug} className="tm-fade-up" style={{ '--tm-delay': `${Math.min(i, 8) * 50}ms` } as React.CSSProperties}>
                  <RoadmapCard roadmap={r} sort={sort} q={q} />
                </li>
              ))}
            </ul>

            {(page > 1 || list.hasMore) && (
              <nav className="mt-10 flex items-center justify-center gap-3 text-sm" aria-label="Pages">
                {page > 1 && (
                  <Link href={href({ q, tag, sort, page: page - 1 })} className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/5">
                    ← Previous
                  </Link>
                )}
                <span className="text-white/40">Page {page}</span>
                {list.hasMore && (
                  <Link href={href({ q, tag, sort, page: page + 1 })} className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/5">
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function TagChip({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
          : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white',
      )}
    >
      {label}
      {count !== undefined && <span className="ml-1 text-white/35">{count}</span>}
    </Link>
  )
}

function RoadmapCard({ roadmap: r, sort, q }: { roadmap: ExploreRoadmap; sort: ExploreSort; q?: string }) {
  return (
    // The title link is stretched over the card; tag links sit above it, so links never nest.
    <article className="tm-lift relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-400/30 hover:bg-white/[0.05]">
      <h2 className="text-base font-semibold leading-snug text-white">
        <Link href={`/r/${r.shareSlug}`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-emerald-400/60">
          {r.title}
        </Link>
      </h2>
      {r.description && <p className="mt-1.5 line-clamp-2 text-sm text-white/55">{r.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
        <span className="inline-flex items-center gap-1"><MapPin size={12} /> {r.steps} step{r.steps === 1 ? '' : 's'}</span>
        {r.milestones > 0 && (
          <span className="inline-flex items-center gap-1"><Trophy size={12} /> {r.milestones}</span>
        )}
        <span className="inline-flex items-center gap-1"><Eye size={12} /> {compact.format(r.viewCount)} views</span>
        {r.forkCount > 0 && (
          <span className="inline-flex items-center gap-1"><GitFork size={12} /> {compact.format(r.forkCount)}</span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="relative z-10 flex flex-wrap gap-1.5">
          {r.tags.slice(0, 4).map((t) => (
            <Link key={t} href={href({ q, sort, tag: t })} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/55 hover:bg-emerald-400/15 hover:text-emerald-200">
              #{t}
            </Link>
          ))}
        </div>
        <span className="shrink-0 text-[11px] text-white/35">Updated {updatedAgo(r.updatedAt)}</span>
      </div>
    </article>
  )
}
