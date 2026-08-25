import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const STORAGE_KEY = 'writing:split'
const DEFAULT_FRACTION = 0.58
const MIN_FRACTION = 0.32
const MAX_FRACTION = 0.72
const STEP = 0.02
const COARSE_STEP = 0.1

function clamp(fraction: number): number {
  return Math.min(MAX_FRACTION, Math.max(MIN_FRACTION, fraction))
}

function readStored(): number {
  if (typeof window === 'undefined') return DEFAULT_FRACTION
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_FRACTION
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_FRACTION
}

type UseSplitPaneOptions = {
  /** When true the panes stack and the separator is inert (narrow viewports). */
  disabled?: boolean
}

/**
 * Draggable column split for the writing article layout. The live gesture writes
 * `--writing-split` straight to the container so dragging never re-renders the
 * article body (which can hold WebGL canvases).
 */
export function useSplitPane({ disabled = false }: UseSplitPaneOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fraction, setFraction] = useState(readStored)
  const [dragging, setDragging] = useState(false)
  /** Mirrors `fraction` so repeated key presses in one batch each build on the last. */
  const fractionRef = useRef(fraction)
  const drag = useRef({
    active: false,
    pointerId: -1,
    frame: 0,
    next: fraction,
    handle: null as HTMLElement | null,
  })

  const paint = useCallback((value: number) => {
    containerRef.current?.style.setProperty(
      '--writing-split',
      `${(value * 100).toFixed(2)}%`,
    )
  }, [])

  const commit = useCallback(
    (value: number) => {
      const clamped = clamp(value)
      fractionRef.current = clamped
      setFraction(clamped)
      paint(clamped)
      window.localStorage.setItem(STORAGE_KEY, clamped.toFixed(4))
    },
    [paint],
  )

  useEffect(() => {
    paint(disabled ? DEFAULT_FRACTION : fraction)
  }, [disabled, fraction, paint])

  const stopDrag = useCallback(
    (pointerId: number) => {
      if (!drag.current.active || pointerId !== drag.current.pointerId) return
      if (drag.current.frame) {
        cancelAnimationFrame(drag.current.frame)
        drag.current.frame = 0
      }
      const handle = drag.current.handle
      drag.current.active = false
      drag.current.pointerId = -1
      drag.current.handle = null
      setDragging(false)
      document.body.classList.remove('is-split-dragging')
      if (handle?.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId)
      commit(drag.current.next)
    },
    [commit],
  )

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled || e.button !== 0) return
      if (!containerRef.current) return
      e.preventDefault()
      drag.current.active = true
      drag.current.pointerId = e.pointerId
      drag.current.next = fractionRef.current
      drag.current.handle = e.currentTarget
      setDragging(true)
      document.body.classList.add('is-split-dragging')
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [disabled],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!drag.current.active || e.pointerId !== drag.current.pointerId) return
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return
      drag.current.next = clamp((e.clientX - rect.left) / rect.width)
      if (drag.current.frame) return
      drag.current.frame = requestAnimationFrame(() => {
        drag.current.frame = 0
        paint(drag.current.next)
      })
    },
    [paint],
  )

  const onPointerEnd = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => stopDrag(e.pointerId),
    [stopDrag],
  )

  const onLostPointerCapture = useCallback(() => {
    if (!drag.current.active) return
    stopDrag(drag.current.pointerId)
  }, [stopDrag])

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled) return
      const step = e.shiftKey ? COARSE_STEP : STEP
      switch (e.key) {
        case 'ArrowLeft':
          commit(fractionRef.current - step)
          break
        case 'ArrowRight':
          commit(fractionRef.current + step)
          break
        case 'Home':
          commit(MIN_FRACTION)
          break
        case 'End':
          commit(MAX_FRACTION)
          break
        case 'Enter':
        case ' ':
          commit(DEFAULT_FRACTION)
          break
        default:
          return
      }
      e.preventDefault()
    },
    [commit, disabled],
  )

  const reset = useCallback(() => commit(DEFAULT_FRACTION), [commit])

  useEffect(() => {
    return () => {
      document.body.classList.remove('is-split-dragging')
    }
  }, [])

  return {
    containerRef,
    dragging,
    /** Percent of the container given to the prose column, for `aria-valuenow`. */
    percent: Math.round(fraction * 100),
    minPercent: Math.round(MIN_FRACTION * 100),
    maxPercent: Math.round(MAX_FRACTION * 100),
    separatorProps: disabled
      ? {}
      : {
          onPointerDown,
          onPointerMove,
          onPointerUp: onPointerEnd,
          onPointerCancel: onPointerEnd,
          onLostPointerCapture,
          onKeyDown,
          onDoubleClick: reset,
        },
  }
}
