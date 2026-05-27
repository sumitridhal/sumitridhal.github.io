import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef, type RefObject } from 'react'

import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'

/** Top → center → bottom keyframes for fan tuck (progress 0, 0.5, 1). */
function lerpFanKeyframe(progress: number, top: number, mid: number, bottom: number) {
  if (progress <= 0.5) {
    const t = progress * 2
    return top + t * (mid - top)
  }
  const t = (progress - 0.5) * 2
  return mid + t * (bottom - mid)
}

function applyDeckFanStyles(decks: HTMLElement[], progress: number) {
  const rightX = lerpFanKeyframe(progress, -2, -5, -45)
  const rightRot = lerpFanKeyframe(progress, 7, 5, 3)
  const leftX = lerpFanKeyframe(progress, 2, 5, 45)
  const leftRot = lerpFanKeyframe(progress, -7, -5, -3)

  for (const deck of decks) {
    deck.style.setProperty('--deck-scroll-right-x', `${rightX}%`)
    deck.style.setProperty('--deck-scroll-right-rot', `${rightRot}deg`)
    deck.style.setProperty('--deck-scroll-left-x', `${leftX}%`)
    deck.style.setProperty('--deck-scroll-left-rot', `${leftRot}deg`)
  }
}

function clearDeckFanStyles(decks: HTMLElement[]) {
  const props = [
    '--deck-scroll-right-x',
    '--deck-scroll-right-rot',
    '--deck-scroll-left-x',
    '--deck-scroll-left-rot',
  ] as const
  for (const deck of decks) {
    for (const prop of props) {
      deck.style.removeProperty(prop)
    }
  }
}

type UseWorkDeckScrollScrubOptions = {
  enabled: boolean
  rootRef: RefObject<HTMLElement | null>
  onScrollActiveChange?: (active: boolean) => void
}

/**
 * Scrubs side-card fan transforms on `.work-picker__deck` while scrolling through `#work`.
 * Does not change which card is centered — only `--deck-scroll-*` CSS variables.
 */
export function useWorkDeckScrollScrub({
  enabled,
  rootRef,
  onScrollActiveChange,
}: UseWorkDeckScrollScrubOptions) {
  useLenisScrollTrigger()

  const onScrollActiveChangeRef = useRef(onScrollActiveChange)
  onScrollActiveChangeRef.current = onScrollActiveChange

  useLayoutEffect(() => {
    if (!enabled) return

    const work = document.getElementById('work')
    const root = rootRef.current
    if (!work || !root) return

    const getDecks = () =>
      Array.from(root.querySelectorAll<HTMLElement>('.work-picker__deck'))

    const st = ScrollTrigger.create({
      trigger: work,
      start: 'top 75%',
      end: 'bottom 25%',
      scrub: 0.35,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const active = self.progress > 0 && self.progress < 1
        onScrollActiveChangeRef.current?.(active)
        if (active) {
          applyDeckFanStyles(getDecks(), self.progress)
        } else {
          clearDeckFanStyles(getDecks())
        }
      },
    })

    return () => {
      st.kill()
      clearDeckFanStyles(getDecks())
      onScrollActiveChangeRef.current?.(false)
    }
  }, [enabled, rootRef])
}
