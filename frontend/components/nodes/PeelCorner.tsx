'use client'

/**
 * PeelCorner — a realistic peeling / curling bottom-right corner for sticky notes.
 *
 * The parent card is clipped with a pentagon `clip-path` so its own bottom-right
 * corner is "gone" (the paper has folded away). This element fills that gap with
 * the *underside* of the sheet, curling up toward the tip:
 *
 *   • A lower-right triangle (the folded-back flap), coloured with `back`.
 *   • A diagonal gradient: deep shadow at the crease → lit sheen toward the tip,
 *     which reads as a rolled/curled surface rather than a flat fold.
 *   • `drop-shadow` offset up-left, so the lifted flap casts a contact shadow onto
 *     the card above it — the cue that sells "peeling off the surface".
 *
 * `drop-shadow` follows the triangular clip-path, so the cast shadow hugs the
 * diagonal crease instead of a bounding box.
 */
export function PeelCorner({ size, back }: { size: number; back: string }) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0"
        style={{
          // lower-right triangle: crease runs bottom-left → top-right
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          background: `
            linear-gradient(135deg,
              rgba(0,0,0,0.42) 0%,
              rgba(0,0,0,0.12) 26%,
              rgba(255,255,255,0) 58%,
              rgba(255,255,255,0.42) 100%),
            linear-gradient(${back}, ${back})
          `,
          borderBottomRightRadius: Math.round(size * 0.18),
          // lift: flap casts a soft shadow up-left onto the card
          filter: 'drop-shadow(-3px -3px 4px rgba(0,0,0,0.38))',
        }}
      />
    </div>
  )
}
