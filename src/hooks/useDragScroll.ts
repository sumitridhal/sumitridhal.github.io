import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const DRAG_THRESHOLD_PX = 6

type UseDragScrollOptions = {
  /** When true, pointer drag handlers are not attached (native / touch scroll only). */
  disabled?: boolean
  /** Prefer non-animated scroll for keyboard nudging (e.g. reduced motion). */
  reducedMotion?: boolean
}

/**
 * Horizontal drag-to-scroll for overflow containers (catalog / rail layouts).
 * Suppresses accidental link activation after a drag gesture.
 */
export function useDragScroll({
  disabled = false,
  reducedMotion = false,
}: UseDragScrollOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    suppressClick: false,
  })

  const cleanupPointer = useCallback((pointerId: number) => {
    const el = ref.current
    if (!drag.current.active || pointerId !== drag.current.pointerId) return
    const suppress = drag.current.suppressClick
    drag.current.active = false
    drag.current.pointerId = -1
    drag.current.suppressClick = false
    setDragging(false)
    if (el?.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
    if (suppress && el) {
      el.addEventListener(
        'click',
        (ev) => {
          ev.preventDefault()
          ev.stopImmediatePropagation()
        },
        { capture: true, once: true },
      )
    }
  }, [])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled || e.button !== 0) return
      const el = ref.current
      if (!el) return
      drag.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startScroll: el.scrollLeft,
        suppressClick: false,
      }
      el.setPointerCapture(e.pointerId)
    },
    [disabled],
  )

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return
    const el = ref.current
    if (!el) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      drag.current.suppressClick = true
      setDragging(true)
    }
    el.scrollLeft = drag.current.startScroll - dx
  }, [])

  const onPointerEnd = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      cleanupPointer(e.pointerId)
    },
    [cleanupPointer],
  )

  const onLostPointerCapture = useCallback(() => {
    if (!drag.current.active) return
    cleanupPointer(drag.current.pointerId)
  }, [cleanupPointer])

  useEffect(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) return
      const next = el.scrollLeft + e.deltaY
      const clamped = Math.min(maxScroll, Math.max(0, next))
      if (clamped === el.scrollLeft) return
      el.scrollLeft = clamped
      e.preventDefault()
      e.stopPropagation()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [disabled])

  useEffect(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      const step = Math.max(120, Math.min(el.clientWidth * 0.4, 280))
      const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        el.scrollBy({ left: step, behavior })
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        el.scrollBy({ left: -step, behavior })
      }
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [disabled, reducedMotion])

  return {
    ref,
    dragging,
    dragScrollProps: disabled
      ? {}
      : {
          onPointerDown,
          onPointerMove,
          onPointerUp: onPointerEnd,
          onPointerCancel: onPointerEnd,
          onLostPointerCapture,
        },
  }
}
