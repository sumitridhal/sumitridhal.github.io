import gsap from 'gsap'

const panelTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>()

function getRevealTargets(panel: HTMLElement) {
  return {
    media: panel.querySelectorAll<HTMLElement>('[data-home-reveal-media]'),
    content: panel.querySelectorAll<HTMLElement>('[data-home-reveal-content]'),
    items: panel.querySelectorAll<HTMLElement>('[data-home-reveal]'),
  }
}

function killRevealTweens(panel: HTMLElement) {
  const { media, content, items } = getRevealTargets(panel)
  gsap.killTweensOf([...media, ...content, ...items])
}

export function resetPanelReveal(panel: HTMLElement) {
  const { media, content, items } = getRevealTargets(panel)
  gsap.set(media, { yPercent: 8, scale: 1.08, opacity: 0 })
  gsap.set(content, { y: 32, opacity: 0 })
  gsap.set(items, { y: 40, opacity: 0 })
}

export function playPanelReveal(panel: HTMLElement) {
  const { media, content, items } = getRevealTargets(panel)

  const existing = panelTimelines.get(panel)
  existing?.kill()
  killRevealTweens(panel)

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, timeScale: 1 })

  if (media.length) {
    tl.fromTo(
      media,
      { yPercent: 8, scale: 1.08, opacity: 0 },
      { yPercent: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power2.inOut' },
      0,
    )
  }

  if (content.length) {
    tl.fromTo(
      content,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, stagger: 0.08 },
      0.2,
    )
  }

  if (items.length) {
    tl.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.06,
      },
      content.length ? '-=0.35' : 0.15,
    )
  }

  panelTimelines.set(panel, tl)
  return tl
}

/** Instantly show revealed state (scroll up back into a panel). Keeps timeline at end for reverse. */
export function showPanelRevealed(panel: HTMLElement) {
  const tl = playPanelReveal(panel)
  tl.progress(1, false).pause()
  tl.timeScale(1)
  return tl
}

export function reversePanelReveal(panel: HTMLElement) {
  const tl = panelTimelines.get(panel)

  if (tl && tl.progress() > 0) {
    killRevealTweens(panel)
    tl.timeScale(1.15)
    tl.reverse()
    return tl
  }

  resetPanelReveal(panel)
  panelTimelines.delete(panel)
  return null
}

export function killPanelReveal(panel: HTMLElement) {
  panelTimelines.get(panel)?.kill()
  panelTimelines.delete(panel)
  killRevealTweens(panel)
}
