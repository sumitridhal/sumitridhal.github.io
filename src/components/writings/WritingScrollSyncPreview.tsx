import { useCallback, useEffect, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const CONTENT_HEIGHT = 1180
const MARKER_GAP = 118
const DEMO_MS = 2100

const paneStyle = {
  position: 'relative',
  minWidth: 0,
  border: '1px solid color-mix(in srgb, currentColor 28%, transparent)',
  background: '#0a0c10',
} as const

const scrollerStyle = {
  position: 'relative',
  height: '252px',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
} as const

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.max(1, Math.round(rect.width * dpr))
  const height = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  return { width: rect.width, height: rect.height, dpr }
}

function drawCanvas(canvas: HTMLCanvasElement, scrollTop: number, stale: boolean) {
  const context = canvas.getContext('2d')
  if (!context) return
  const { width, height, dpr } = resizeCanvas(canvas)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)
  context.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
  context.textBaseline = 'bottom'

  for (let marker = 0; marker <= CONTENT_HEIGHT; marker += MARKER_GAP) {
    const y = marker - scrollTop
    if (y < -4 || y > height + 4) continue
    context.strokeStyle = stale ? '#ff5c8a' : '#65e6ff'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(width * 0.48, y)
    context.lineTo(width, y)
    context.stroke()
    context.fillStyle = stale ? '#ff91ae' : '#9af0ff'
    context.fillText(`canvas ${marker}`, width * 0.5, y - 4)
  }
}

function MarkerContent() {
  return (
    <div style={{ position: 'relative', height: `${CONTENT_HEIGHT}px`, background: 'linear-gradient(180deg, #171b23, #08090c)' }}>
      {Array.from({ length: Math.ceil(CONTENT_HEIGHT / MARKER_GAP) + 1 }, (_, index) => {
        const top = index * MARKER_GAP
        return (
          <div
            key={top}
            style={{
              position: 'absolute',
              top,
              left: 0,
              width: '48%',
              borderTop: '2px solid #ffc857',
              padding: '4px 8px',
              color: '#ffd987',
              font: '10px ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            DOM {top}
          </div>
        )
      })}
    </div>
  )
}

export type WritingScrollSyncPreviewProps = {
  caption?: string
  className?: string
}

export function WritingScrollSyncPreview({
  caption = 'Press Play to fast-scroll both panes.',
  className = '',
}: WritingScrollSyncPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const staleScroller = useRef<HTMLDivElement>(null)
  const syncScroller = useRef<HTMLDivElement>(null)
  const staleCanvas = useRef<HTMLCanvasElement>(null)
  const syncCanvas = useRef<HTMLCanvasElement>(null)
  const previousScroll = useRef(0)
  const frame = useRef<number | null>(null)
  const animation = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [drift, setDrift] = useState(0)

  const paint = useCallback(() => {
    frame.current = null
    const staleActual = staleScroller.current?.scrollTop ?? 0
    const syncActual = syncScroller.current?.scrollTop ?? 0
    if (staleCanvas.current) drawCanvas(staleCanvas.current, previousScroll.current, true)
    if (syncCanvas.current) drawCanvas(syncCanvas.current, syncActual, false)
    setDrift(Math.abs(staleActual - previousScroll.current))
    previousScroll.current = staleActual
  }, [])

  const requestPaint = useCallback(() => {
    if (frame.current == null) frame.current = requestAnimationFrame(paint)
  }, [paint])

  useEffect(() => {
    requestPaint()
    window.addEventListener('resize', requestPaint)
    return () => {
      window.removeEventListener('resize', requestPaint)
      if (frame.current != null) cancelAnimationFrame(frame.current)
      if (animation.current != null) cancelAnimationFrame(animation.current)
    }
  }, [requestPaint])

  const mirrorManualScroll = useCallback(
    (source: 'stale' | 'sync') => {
      const from = source === 'stale' ? staleScroller.current : syncScroller.current
      const to = source === 'stale' ? syncScroller.current : staleScroller.current
      if (from && to && Math.abs(to.scrollTop - from.scrollTop) > 0.5) to.scrollTop = from.scrollTop
      requestPaint()
    },
    [requestPaint],
  )

  const play = useCallback(() => {
    if (reduced || playing) return
    setPlaying(true)
    const start = performance.now()
    const startY = staleScroller.current?.scrollTop ?? 0
    const maxScroll = Math.max(0, CONTENT_HEIGHT - 252)
    const destination = startY > maxScroll * 0.55 ? 0 : maxScroll

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DEMO_MS)
      const next = startY + (destination - startY) * easeInOutCubic(progress)
      if (staleScroller.current) staleScroller.current.scrollTop = next
      if (syncScroller.current) syncScroller.current.scrollTop = next
      requestPaint()
      if (progress < 1) {
        animation.current = requestAnimationFrame(tick)
      } else {
        animation.current = null
        setPlaying(false)
      }
    }
    animation.current = requestAnimationFrame(tick)
  }, [playing, reduced, requestPaint])

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-generative-play-preview__caption">{caption}</figcaption> : null}
      <div className="writing-generative-play-preview__hud">
        <div className="writing-generative-play-preview__control-row">
          <button
            type="button"
            onClick={play}
            disabled={playing || reduced}
            style={{ padding: '0.45rem 0.8rem', border: '1px solid currentColor', background: 'transparent', color: 'inherit', cursor: reduced ? 'not-allowed' : 'pointer' }}
          >
            {playing ? 'Playing…' : 'Play fast scroll'}
          </button>
          <span>Stale-frame drift</span>
          <span className="writing-generative-play-preview__control-value">{drift.toFixed(1)} px</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.55rem' }}>
        <section style={paneStyle} aria-label="Independent loops with a stale canvas value">
          <strong style={{ display: 'block', padding: '0.55rem 0.65rem', color: '#ff91ae', fontSize: '0.75rem' }}>
            TWO LOOPS · PREVIOUS FRAME
          </strong>
          <div ref={staleScroller} style={scrollerStyle} onScroll={() => mirrorManualScroll('stale')}>
            <MarkerContent />
          </div>
          <canvas
            ref={staleCanvas}
            aria-label="Canvas markers using the previous scroll frame"
            role="img"
            style={{ position: 'absolute', inset: '2rem 0 0', width: '100%', height: '252px', pointerEvents: 'none' }}
          />
        </section>
        <section style={paneStyle} aria-label="Shared loop with a same-frame canvas value">
          <strong style={{ display: 'block', padding: '0.55rem 0.65rem', color: '#9af0ff', fontSize: '0.75rem' }}>
            ONE LOOP · SHARED SNAPSHOT
          </strong>
          <div ref={syncScroller} style={scrollerStyle} onScroll={() => mirrorManualScroll('sync')}>
            <MarkerContent />
          </div>
          <canvas
            ref={syncCanvas}
            aria-label="Canvas markers using the current scroll snapshot"
            role="img"
            style={{ position: 'absolute', inset: '2rem 0 0', width: '100%', height: '252px', pointerEvents: 'none' }}
          />
        </section>
      </div>
      {reduced ? <p style={{ margin: '0.6rem 0 0', fontSize: '0.75rem' }}>Auto-play is disabled by reduced-motion preference; both panes remain manually scrollable.</p> : null}
    </figure>
  )
}
