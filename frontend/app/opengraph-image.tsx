import { ImageResponse } from 'next/og'

// Default share card for every page; /r/[slug] pages inherit it too.
export const alt = 'Trailmap: build and share learning roadmaps'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#07190f'
const EMERALD = '#34d399'

/** A sticky-note card like the ones on the canvas. */
function Card({ x, y, title, state }: { x: number; y: number; title: string; state: 'done' | 'next' | 'locked' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 230,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 20px',
        borderRadius: 6,
        background: '#7EC8F5',
        opacity: state === 'next' ? 1 : state === 'done' ? 0.6 : 0.45,
        boxShadow: state === 'next' ? `0 0 0 4px ${EMERALD}, 0 0 44px rgba(52,211,153,0.6)` : '6px 10px 0 rgba(0,0,0,0.28)',
      }}
    >
      {/* Glyphs drawn as SVG: emoji or symbols missing from the default font make next/og fetch fonts at build time. */}
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 16, color: 'rgba(23,37,84,0.55)', fontWeight: 600 }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="7.5" fill="none" stroke="#172554" strokeWidth="1.8" />
          {state === 'done' && <path d="M5.5 9.2 L8 11.6 L12.6 6.6" fill="none" stroke="#172554" strokeWidth="1.8" />}
        </svg>
        <div style={{ display: 'flex', marginLeft: 8 }}>{state === 'locked' ? 'Step · locked' : 'Step'}</div>
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 6,
          fontSize: 24,
          fontWeight: 700,
          color: '#172554',
          textDecoration: state === 'done' ? 'line-through' : 'none',
        }}
      >
        {title}
      </div>
    </div>
  )
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: BG,
          backgroundImage: 'radial-gradient(circle, #1e4535 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left: brand + pitch */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 80px', width: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="72" height="72" viewBox="0 0 64 64">
              <rect width="64" height="64" rx="14" fill="#0b2116" />
              <path d="M8 50 L32 12 L56 50 Z" fill={EMERALD} stroke={EMERALD} strokeWidth="4" strokeLinejoin="round" />
              <path d="M22 50 C 22 42, 40 42, 38 34 C 36 27, 28 28, 31 19" fill="none" stroke="#0b2116" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
            <div style={{ display: 'flex', marginLeft: 20, fontSize: 44, fontWeight: 700, color: 'white' }}>Trailmap</div>
          </div>
          <div style={{ display: 'flex', marginTop: 40, fontSize: 60, fontWeight: 800, lineHeight: 1.1, color: 'white' }}>
            Build and share learning roadmaps
          </div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 28, lineHeight: 1.4, color: 'rgba(255,255,255,0.6)' }}>
            Plan the steps, follow the trail, tick them off as you go.
          </div>
        </div>

        {/* Right: a small trail, drawn like the canvas */}
        <svg width="1200" height="630" style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M 905 158 C 905 210, 820 200, 820 262" fill="none" stroke={EMERALD} strokeWidth="5" />
          <path d="M 820 352 C 820 410, 960 400, 960 452" fill="none" stroke="#94a3b8" strokeWidth="4" />
        </svg>
        <Card x={790} y={70} title="HTTP basics" state="done" />
        <Card x={705} y={262} title="SQL basics" state="next" />
        <Card x={845} y={452} title="Build a REST API" state="locked" />
        <div
          style={{
            position: 'absolute',
            left: 705,
            top: 222,
            display: 'flex',
            padding: '4px 14px',
            borderRadius: 999,
            background: EMERALD,
            color: '#022c22',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Next up
        </div>
      </div>
    ),
    size,
  )
}
