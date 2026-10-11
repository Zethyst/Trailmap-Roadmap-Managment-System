'use client'

/** Small circular progress ring with a centered percentage label. */
export function CircularProgress({
  value,
  size = 52,
  stroke = 4,
}: {
  value: number
  size?: number
  stroke?: number
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  const done = pct >= 100

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={done ? 'text-emerald-400' : 'text-emerald-500'}
          style={{ transition: 'stroke-dashoffset 450ms ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-emerald-300">
        {pct}%
      </span>
    </div>
  )
}
