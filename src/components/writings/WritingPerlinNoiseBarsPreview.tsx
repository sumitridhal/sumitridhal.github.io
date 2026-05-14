import { useCallback, useEffect, useRef } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { perlin2Normalized } from '@/lib/perlin2d'

const FALLBACK_BG = '#eef0ec'
const FALLBACK_BAR = '#ff4d6d'

const TIME_BASE = 0.45
const PLAYBACK_SPEED = 2

const DEFAULTS = {
  noiseScaleX: 0.1,
  noiseScaleY: 0.12,
  minWidthFrac: 0.12,
  maxWidthFrac: 0.98,
} as const

export type WritingPerlinNoiseBarsPreviewProps = {
  caption?: string
  className?: string
  /** Grid columns (reference art ~70). */
  cols?: number
  /** Grid rows (reference art ~11). */
  rows?: number
  /** Noise frequency along columns (higher = denser / smaller blobs). */
  noiseScaleX?: number
  /** Noise frequency along rows. */
  noiseScaleY?: number
  /** Min bar width as fraction of cell width [0,1]. */
  minWidthFrac?: number
  /** Max bar width as fraction of cell width [0,1]. */
  maxWidthFrac?: number
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

export function WritingPerlinNoiseBarsPreview({
  caption = 'Perlin sample per cell → bar width.',
  className = '',
  cols = 70,
  rows = 11,
  noiseScaleX = DEFAULTS.noiseScaleX,
  noiseScaleY = DEFAULTS.noiseScaleY,
  minWidthFrac = DEFAULTS.minWidthFrac,
  maxWidthFrac = DEFAULTS.maxWidthFrac,
}: WritingPerlinNoiseBarsPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const tRef = useRef(0)
  const canvasBgRef = useRef(FALLBACK_BG)
  const canvasBarRef = useRef(FALLBACK_BAR)
  const lastColorReadCssWRef = useRef(-1)

  const draw = useCallback(
    (timePhase: number) => {
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) return

      const cssW = wrap.clientWidth
      if (cssW !== lastColorReadCssWRef.current) {
        lastColorReadCssWRef.current = cssW
        const cs = getComputedStyle(wrap)
        const bg = cs.getPropertyValue('--writing-perlin-canvas-bg').trim()
        const bar = cs.getPropertyValue('--writing-perlin-canvas-bar').trim()
        if (bg) canvasBgRef.current = bg
        if (bar) canvasBarRef.current = bar
      }
      const cssH = Math.max(280, Math.min(560, cssW * (rows / cols) * 1.85))
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const bw = Math.max(1, Math.floor(cssW * dpr))
      const bh = Math.max(1, Math.floor(cssH * dpr))
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = canvasBgRef.current
      ctx.fillRect(0, 0, bw, bh)

      const cellW = bw / cols
      const cellH = bh / rows
      const minPx = Math.max(0.5, cellW * minWidthFrac)
      const maxPx = Math.max(minPx + 0.5, cellW * maxWidthFrac)

      ctx.fillStyle = canvasBarRef.current
      for (let row = 0; row < rows; row++) {
        const y0 = row * cellH
        const y1 = (row + 1) * cellH
        const barH = y1 - y0
        for (let col = 0; col < cols; col++) {
          const driftX = timePhase * 0.32 + Math.sin(timePhase * 0.55 + row * 0.09) * 0.14
          const driftY = timePhase * 0.24 + Math.cos(timePhase * 0.48 + col * 0.07) * 0.12
          const nx = col * noiseScaleX + driftX
          const ny = row * noiseScaleY + driftY
          const n = perlin2Normalized(nx, ny)
          const w = minPx + clamp01(n) * (maxPx - minPx)
          const cx = (col + 0.5) * cellW
          const x = cx - w * 0.5
          ctx.fillRect(x, y0, w, barH)
        }
      }
    },
    [cols, rows, noiseScaleX, noiseScaleY, minWidthFrac, maxWidthFrac],
  )

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const ro = new ResizeObserver(() => {
      draw(reduced ? 0 : tRef.current)
    })
    ro.observe(wrap)
    draw(reduced ? 0 : tRef.current)

    return () => ro.disconnect()
  }, [draw, reduced])

  useEffect(() => {
    if (reduced) {
      draw(0)
      return
    }

    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      tRef.current += dt * TIME_BASE * PLAYBACK_SPEED
      draw(tRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, reduced])

  return (
    <figure className={`writing-perlin-bars ${className}`.trim()}>
      {caption ? <figcaption className="writing-perlin-bars__caption">{caption}</figcaption> : null}
      <div className="writing-perlin-bars__body">
        <div ref={wrapRef} className="writing-perlin-bars__stage">
          <canvas ref={canvasRef} className="writing-perlin-bars__canvas" aria-hidden />
        </div>
      </div>
    </figure>
  )
}
