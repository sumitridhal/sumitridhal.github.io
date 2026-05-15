import { useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { hrefHome } from '@/i18n/routes'
import { useLenis } from '@/providers/LenisProvider'

const SECTIONS = ['hero', 'experiments', 'work', 'writings', 'talks', 'books'] as const

const SECTION_LABEL_KEYS: Record<(typeof SECTIONS)[number], string> = {
  hero: 'common.sections.hero',
  work: 'common.sections.work',
  experiments: 'common.sections.experiments',
  writings: 'common.sections.writings',
  talks: 'common.sections.talks',
  books: 'common.sections.books',
}

export function Minimap() {
  const { t } = useI18n()
  const lenis = useLenis()
  const onHome = useMatch({ path: hrefHome, end: true })
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
        const labelKey = SECTION_LABEL_KEYS[id]
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
