import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import {
  COLS_FULL,
  COLS_HALF,
  ROWS,
  drawInvaderField,
  fullCell,
  halfGridFromSeed,
  invaderPixelColor,
  tileStyleFromSeed,
} from '@/lib'

const FIELD_TILES = 3

export type WritingInvaderFractalPreviewProps = {
  caption?: string
  className?: string
}

export function WritingInvaderFractalPreview({
  caption = 'Shuffle silhouettes in a 3×3 gallery: each invader keeps one hue with structured lightness grades (stripes, gradient, or split)—not random per-pixel colour.',
  className = '',
}: WritingInvaderFractalPreviewProps) {
  const uid = useId()
  const fractalWrapRef = useRef<HTMLDivElement>(null)
  const fractalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [seed, setSeed] = useState(() => Math.random())

  const half = useMemo(() => halfGridFromSeed(seed, 0, 0), [seed])
  const heroStyle = useMemo(() => tileStyleFromSeed(seed, 0, 0), [seed])

  const shuffle = useCallback(() => {
    setSeed(Math.random())
  }, [])

  const paintField = useCallback(() => {
    const wrap = fractalWrapRef.current
    const canvas = fractalCanvasRef.current
    if (!wrap || !canvas) return

    const cssW = wrap.clientWidth
    if (cssW < 1) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const bw = Math.max(1, Math.floor(cssW * dpr))
    const bh = bw

    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw
      canvas.height = bh
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawInvaderField(ctx, bw, bh, seed, FIELD_TILES)
  }, [seed])

  useEffect(() => {
    paintField()
    const wrap = fractalWrapRef.current
    if (!wrap) return

    const ro = new ResizeObserver(() => paintField())
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [paintField])

  return (
    <figure className={`writing-invader-fractal-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-invader-fractal-preview__caption">{caption}</figcaption> : null}
      <div className="writing-invader-fractal-preview__toolbar">
        <button type="button" className="writing-invader-fractal-preview__shuffle" onClick={shuffle}>
          Shuffle
        </button>
      </div>
      <div className="writing-invader-fractal-preview__fractal-wrap" ref={fractalWrapRef}>
        <canvas
          ref={fractalCanvasRef}
          className="writing-invader-fractal-preview__fractal-canvas"
          role="img"
          aria-label="Three by three gallery of colourful symmetric invader pixel sprites"
        />
      </div>
      <div className="writing-invader-fractal-preview__body">
        <div className="writing-invader-fractal-preview__half" aria-hidden="true">
          <p className="writing-invader-fractal-preview__label">Half (3×5)</p>
          <div
            className="writing-invader-fractal-preview__mini"
            style={{ gridTemplateColumns: `repeat(${COLS_HALF}, 1fr)` }}
          >
            {Array.from({ length: COLS_HALF * ROWS }, (_, i) => {
              const x = i % COLS_HALF
              const y = Math.floor(i / COLS_HALF)
              const on = half[x]![y]!
              return <span key={`h-${x}-${y}`} className={on ? 'is-on' : 'is-off'} />
            })}
          </div>
        </div>
        <div className="writing-invader-fractal-preview__arrow" aria-hidden="true">
          →
        </div>
        <div className="writing-invader-fractal-preview__full">
          <p className="writing-invader-fractal-preview__label">Mirrored 5×5</p>
          <div
            className="writing-invader-fractal-preview__grid writing-invader-fractal-preview__grid--colour"
            style={{ gridTemplateColumns: `repeat(${COLS_FULL}, 1fr)` }}
            role="img"
            aria-label="Five by five symmetric invader pixel grid from the current shuffle seed"
            id={`${uid}-grid`}
          >
            {Array.from({ length: COLS_FULL * ROWS }, (_, i) => {
              const x = i % COLS_FULL
              const y = Math.floor(i / COLS_FULL)
              const on = fullCell(half, x, y)
              return (
                <span
                  key={`f-${x}-${y}`}
                  style={{ background: invaderPixelColor(heroStyle, x, y, on) }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </figure>
  )
}
