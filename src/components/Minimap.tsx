import { useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { useLenis } from '@/providers/LenisProvider'

const SECTIONS = ['hero', 'work', 'about-teaser'] as const

export function Minimap() {
  const { locale, t } = useI18n()
  const lenis = useLenis()
  const onHome = useMatch({ path: `/${locale}`, end: true })
  const [active, setActive] = useState<string>('hero')

  useEffect(() => {
    if (!onHome) return
    const nodes = SECTIONS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => !!n,
    )
    if (!nodes.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit?.target.id) setActive(hit.target.id)
      },
      { threshold: [0.2, 0.35, 0.5, 0.65] },
    )
    nodes.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [onHome])

  if (!onHome) return null

  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (lenis && el) {
      lenis.scrollTo(el, { offset: -96, duration: 1.1 })
    } else {
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="minimap" aria-label="Sections">
      {SECTIONS.map((id) => {
        const labelKey =
          id === 'hero'
            ? 'common.sections.hero'
            : id === 'work'
              ? 'common.sections.work'
              : 'common.sections.aboutTeaser'
        return (
          <button
            key={id}
            type="button"
            className={`minimap__btn${active === id ? ' minimap__btn--active' : ''}`}
            aria-label={t(labelKey)}
            aria-current={active === id ? 'true' : undefined}
            onClick={() => jump(id)}
          />
        )
      })}
    </nav>
  )
}
