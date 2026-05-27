import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'

import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'
import { useLenis } from '@/providers/LenisProvider'

gsap.registerPlugin(ScrollTrigger)

type ScrollPhase = 'tuck' | 'mid' | 'fan'

/** Interpolate across three keyframes (progress 0, 0.5, 1). */
function lerpThreePoint(progress: number, start: number, mid: number, end: number) {
  if (progress <= 0.5) {
    const t = progress * 2
    return start + t * (mid - start)
  }
  const t = (progress - 0.5) * 2
  return mid + t * (end - mid)
}

function scrollPhaseFor(progress: number): ScrollPhase {
  if (progress < 0.34) return 'tuck'
  if (progress < 0.67) return 'mid'
  return 'fan'
}

function getDecksInWork(): HTMLElement[] {
  const work = document.getElementById('work')
  if (!work) return []
  return Array.from(work.querySelectorAll<HTMLElement>('.work-picker__deck'))
}

function applyDeckFanStyles(decks: HTMLElement[], progress: number) {
  const leftX = lerpThreePoint(progress, 2, 5, 44)
  const rightX = lerpThreePoint(progress, 2, 5, 44)
  const leftRot = lerpThreePoint(progress, -7, -5, -8)
  const rightRot = lerpThreePoint(progress, 7, 5, 8)
  const centerY = lerpThreePoint(progress, -6, -8, -10)
  const fan = progress
  const minWidthRem = lerpThreePoint(progress, 22, 25, 28)
  const phase = scrollPhaseFor(progress)

  for (const deck of decks) {
    if (deck.dataset.expanded === 'true') continue

    deck.style.setProperty('--deck-scroll-left-x', `${leftX}%`)
    deck.style.setProperty('--deck-scroll-right-x', `${rightX}%`)
    deck.style.setProperty('--deck-scroll-left-rot', `${leftRot}deg`)
    deck.style.setProperty('--deck-scroll-right-rot', `${rightRot}deg`)
    deck.style.setProperty('--deck-scroll-center-y', `${centerY}px`)
    deck.style.setProperty('--deck-scroll-y', '4px')
    deck.style.setProperty('--deck-scroll-fan', String(fan))
    deck.style.setProperty('--deck-scroll-min-width', `${minWidthRem}rem`)
    deck.dataset.scrollPhase = phase
  }
}

function clearDeckFanStyles(decks: HTMLElement[]) {
  const props = [
    '--deck-scroll-left-x',
    '--deck-scroll-right-x',
    '--deck-scroll-left-rot',
    '--deck-scroll-right-rot',
    '--deck-scroll-center-y',
    '--deck-scroll-y',
    '--deck-scroll-fan',
    '--deck-scroll-min-width',
  ] as const

  for (const deck of decks) {
    for (const prop of props) {
      deck.style.removeProperty(prop)
    }
    delete deck.dataset.scrollPhase
  }
}

type UseWorkDeckScrollScrubOptions = {
  enabled: boolean
  onScrollActiveChange?: (active: boolean) => void
}

/**
 * Scrubs side-card fan transforms on `.work-picker__deck` while scrolling through `#work`.
 * Tuck at enter → medium at mid → full fan at exit. Does not change centered card index.
 */
export function useWorkDeckScrollScrub({
  enabled,
  onScrollActiveChange,
}: UseWorkDeckScrollScrubOptions) {
  const lenis = useLenis()
  useLenisScrollTrigger()

  const onScrollActiveChangeRef = useRef(onScrollActiveChange)
  onScrollActiveChangeRef.current = onScrollActiveChange

  useLayoutEffect(() => {
    if (!enabled || !lenis) return

    const work = document.getElementById('work')
    if (!work) return

    const sync = (st: ScrollTrigger) => {
      const decks = getDecksInWork()
      const active = st.isActive
      onScrollActiveChangeRef.current?.(active)
      if (active) {
        applyDeckFanStyles(decks, st.progress)
      } else {
        clearDeckFanStyles(decks)
      }
    }

    const st = ScrollTrigger.create({
      trigger: work,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.35,
      invalidateOnRefresh: true,
      onUpdate: sync,
      onRefresh: sync,
      onToggle: sync,
    })

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      sync(st)
    })

    return () => {
      st.kill()
      clearDeckFanStyles(getDecksInWork())
      onScrollActiveChangeRef.current?.(false)
    }
  }, [enabled, lenis])
}
