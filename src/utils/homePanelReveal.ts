import gsap from 'gsap'

export function resetPanelReveal(panel: HTMLElement) {
  const media = panel.querySelectorAll<HTMLElement>('[data-home-reveal-media]')
  const content = panel.querySelectorAll<HTMLElement>('[data-home-reveal-content]')
  const items = panel.querySelectorAll<HTMLElement>('[data-home-reveal]')

  gsap.set(media, { yPercent: 8, scale: 1.08, opacity: 0 })
  gsap.set(content, { y: 32, opacity: 0 })
  gsap.set(items, { y: 40, opacity: 0 })
}

export function playPanelReveal(panel: HTMLElement) {
  const media = panel.querySelectorAll<HTMLElement>('[data-home-reveal-media]')
  const content = panel.querySelectorAll<HTMLElement>('[data-home-reveal-content]')
  const items = panel.querySelectorAll<HTMLElement>('[data-home-reveal]')

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

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
        clearProps: 'transform',
      },
      content.length ? '-=0.35' : 0.15,
    )
  }

  return tl
}
