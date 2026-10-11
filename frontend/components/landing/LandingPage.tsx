import Link from 'next/link'
import {
  ArrowRight, MapPin, Share2, Sparkles, Trophy, Video, Workflow, CheckCircle2,
} from 'lucide-react'

export function LandingPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-[#06130d] text-white">
      {/* ambient green glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(21,128,61,0.18),transparent)]" />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="text-emerald-400">▲</span> Trailmap
        </div>
        <div className="flex items-center gap-2">
          <Link href="/try" className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white">
            Try the canvas
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <Sparkles size={13} /> Local-first · AI-assisted
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          Map your learning journey,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            visually
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Build sequenced roadmaps of steps, milestones and resources on an infinite canvas.
          Share them, fork them, and track your progress — all in one place.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Get started — free <ArrowRight size={16} />
          </Link>
          <Link
            href="/try"
            className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
          >
            Try the canvas
          </Link>
        </div>

        {/* decorative mock canvas */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-[#07190f] p-6 shadow-2xl">
            <div
              className="relative h-56 rounded-xl"
              style={{
                backgroundColor: '#07190f',
                backgroundImage: 'radial-gradient(#1e4535 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            >
              <MockNode className="left-6 top-6" color="#7EC8F5" label="Learn basics" />
              <MockNode className="left-1/2 top-24 -translate-x-1/2" color="#6EDEA0" label="Build a project" />
              <MockNode className="right-6 top-8" color="#FFD233" label="Ship it 🏆" />
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <line x1="23%" y1="30%" x2="50%" y2="60%" stroke="#2f6b4f" strokeWidth="2" />
                <line x1="50%" y1="60%" x2="80%" y2="34%" stroke="#2f6b4f" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/55">
            From an empty canvas to a shareable roadmap in four steps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Step
            n={1}
            icon={MapPin}
            title="Add steps & milestones"
            body="Drop a node onto the canvas for each thing to learn, plus milestones for the big wins."
          />
          <Step
            n={2}
            icon={Workflow}
            title="Connect the path"
            body="Link nodes into a prerequisite flow. Trailmap keeps it acyclic so the order always makes sense."
          />
          <Step
            n={3}
            icon={Video}
            title="Attach resources"
            body="Add videos, links, rich notes, images and checklists to any node — or let AI draft the whole roadmap."
          />
          <Step
            n={4}
            icon={Trophy}
            title="Track & share"
            body="Mark steps done, watch your completion climb, then publish a read-only link anyone can follow or fork."
          />
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature icon={Sparkles} title="AI generation" body="Describe a goal and get an editable roadmap in seconds." />
          <Feature icon={CheckCircle2} title="Progress tracking" body="Per-step completion with a live percentage on your dashboard." />
          <Feature icon={Share2} title="Share & fork" body="Publish a public roadmap; others can fork it into their own." />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-[#07190f] p-12">
          <h2 className="text-3xl font-bold">Ready to build your first roadmap?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/60">
            It’s free, and you can start on the canvas without even signing up.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <Link
              href="/try"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/5"
            >
              Open the canvas
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-white/40">
        <span className="text-emerald-400">▲</span> Trailmap — build and share learning roadmaps.
      </footer>
    </main>
  )
}

function MockNode({ className, color, label }: { className?: string; color: string; label: string }) {
  return (
    <div
      className={`absolute z-10 rounded-md px-3 py-2 text-xs font-bold text-black/80 shadow-lg ${className}`}
      style={{ background: color }}
    >
      {label}
    </div>
  )
}

function Step({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number
  icon: typeof MapPin
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-emerald-500/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Icon size={18} />
        </div>
        <span className="text-xs font-semibold text-white/35">STEP {n}</span>
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/55">{body}</p>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MapPin
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <Icon size={20} className="mt-0.5 shrink-0 text-emerald-400" />
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/55">{body}</p>
      </div>
    </div>
  )
}
