import { useCallback, useEffect, useRef, useState } from 'react'

import type { WritingPreviewStep } from '@/data/writingTypes'

export function useActivePreviewStep(steps: WritingPreviewStep[]) {
  const cuesRef = useRef(new Map<string, HTMLElement>())
  const frameRef = useRef<number | null>(null)
  const [activeId, setActiveId] = useState<string | undefined>(steps[0]?.id)

  const measure = useCallback(() => {
    frameRef.current = null
    if (steps.length === 0) {
      setActiveId(undefined)
      return
    }

    const readingLine = window.innerHeight * 0.4
    let nextId = steps[0].id

    for (const step of steps) {
      const cue = cuesRef.current.get(step.id)
      if (cue && cue.getBoundingClientRect().top <= readingLine) {
        nextId = step.id
      }
    }

    setActiveId((current) => (current === nextId ? current : nextId))
  }, [steps])

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = window.requestAnimationFrame(measure)
  }, [measure])

  const registerCue = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        cuesRef.current.set(id, element)
      } else {
        cuesRef.current.delete(id)
      }
      scheduleMeasure()
    },
    [scheduleMeasure],
  )

  const scrollToCue = useCallback((id: string) => {
    const cue = cuesRef.current.get(id)
    if (!cue) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = window.scrollY + cue.getBoundingClientRect().top - window.innerHeight * 0.35
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    scheduleMeasure()
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [scheduleMeasure])

  return { activeId, registerCue, scrollToCue }
}
