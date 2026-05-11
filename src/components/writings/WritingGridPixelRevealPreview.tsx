import { useId, useMemo, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const COLS = 28
const ROWS = 18

const DEFAULT_IMAGE_SRC = 'https://picsum.photos/seed/grid-pixel-image-reveal/960/640'

function fract01(x: number) {
  return x - Math.floor(x)
}

function hash01(ix: number, iy: number, salt: number) {
  const s = Math.sin(ix * 12.9898 + iy * 78.233 + salt * 43.758) * 43758.5453123
  return fract01(Math.abs(s))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const denom = edge1 - edge0 || 1e-6
  const t = Math.min(1, Math.max(0, (x - edge0) / denom))
  return t * t * (3 - 2 * t)
}

function coverOpacity(progress: number, threshold: number) {
  const w = 0.052
  return 1 - smoothstep(threshold - w, threshold + w, progress)
}

type CellModel = {
  key: string
  r: number
  g: number
  b: number
  threshold: number
}

function buildCells(seed: number): CellModel[] {
  const out: CellModel[] = []
  for (let j = 0; j < ROWS; j++) {
    const yNorm = (j + 0.5) / ROWS
    for (let i = 0; i < COLS; i++) {
      const h = hash01(i, j, seed)
      const h2 = hash01(i, j, seed + 11)
      const threshold = Math.min(
        1,
        Math.max(0, 0.06 + yNorm * 0.84 + (h - 0.5) * 0.26 + (h2 - 0.5) * 0.14),
      )
      const band = hash01(i, j, seed + 3)
      let v: number
      if (band < 0.11) v = 0.04
      else if (band < 0.2) v = 0.96
      else v = 0.18 + hash01(i, j, seed + 7) * 0.62
      out.push({
        key: `${i}-${j}`,
        r: v,
        g: v,
        b: v,
        threshold,
      })
    }
  }
  return out
}

export type WritingGridPixelRevealPreviewProps = {
  caption?: string
  imageSrc?: string
  imageAlt?: string
  className?: string
  seed?: number
}

export function WritingGridPixelRevealPreview({
  caption = 'Scrub reveal: each tile has a seeded threshold biased toward the bottom, like editorial “pixel rain.”',
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = 'Placeholder photograph for the grid reveal demo',
  className = '',
  seed = 42,
}: WritingGridPixelRevealPreviewProps) {
  const rangeId = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [progress, setProgress] = useState(0)
  const cells = useMemo(() => buildCells(seed), [seed])

  const effectiveProgress = reduced ? 1 : progress

  return (
    <figure className={`writing-grid-pixel-reveal ${className}`.trim()}>
      {caption ? <figcaption className="writing-grid-pixel-reveal__caption">{caption}</figcaption> : null}
      <div className="writing-grid-pixel-reveal__body">
        <div className="writing-grid-pixel-reveal__stage">
          <img className="writing-grid-pixel-reveal__img" src={imageSrc} alt={imageAlt} loading="lazy" decoding="async" />
          <div className="writing-grid-pixel-reveal__grid" aria-hidden="true">
            {cells.map((c) => {
              const o = coverOpacity(effectiveProgress, c.threshold)
              return (
                <div
                  key={c.key}
                  className="writing-grid-pixel-reveal__cell"
                  style={{
                    backgroundColor: `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`,
                    opacity: o,
                  }}
                />
              )
            })}
          </div>
        </div>
        <div className="writing-grid-pixel-reveal__controls">
          <label className="writing-grid-pixel-reveal__label" htmlFor={rangeId}>
            <span>Reveal</span>
            <span className="writing-grid-pixel-reveal__value">{Math.round(effectiveProgress * 100)}%</span>
          </label>
          <input
            id={rangeId}
            className="writing-grid-pixel-reveal__range"
            type="range"
            min={0}
            max={1}
            step={0.002}
            value={effectiveProgress}
            disabled={reduced}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={Math.round(effectiveProgress * 1000) / 1000}
            aria-valuetext={`${Math.round(effectiveProgress * 100)} percent revealed`}
            onChange={(e) => {
              if (reduced) return
              setProgress(Number(e.target.value))
            }}
          />
        </div>
      </div>
    </figure>
  )
}
