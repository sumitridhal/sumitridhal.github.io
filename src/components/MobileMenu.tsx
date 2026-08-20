import { useEffect, useRef } from 'react'
import { useLocation, type To } from 'react-router-dom'

import { useAppState } from '@/contexts/AppStateContext'
import { useI18n } from '@/contexts/I18nContext'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import {
  hrefAbout,
  hrefExperiments,
  hrefHome,
  hrefReading,
  hrefWritings,
} from '@/i18n/routes'

export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useAppState()
  const { t } = useI18n()
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const isHome = location.pathname === hrefHome
  const isExperiments = location.pathname === hrefExperiments
  const isWritings =
    location.pathname === hrefWritings || location.pathname.startsWith(`${hrefWritings}/`)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen, setMenuOpen])

  const go = (to: To) => {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}>
      <button
        type="button"
        className="mobile-menu__backdrop"
        aria-label={t('nav.close')}
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
      <div
        ref={panelRef}
        id="mobile-menu-panel"
        className="mobile-menu__panel"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="mobile-menu__link"
          aria-current={isHome ? 'page' : undefined}
          onClick={() => go(hrefHome)}
        >
          {t('nav.home')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          aria-current={location.pathname === hrefAbout ? 'page' : undefined}
          onClick={() => go(hrefAbout)}
        >
          {t('nav.about')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          aria-current={isExperiments ? 'page' : undefined}
          onClick={() => go(hrefExperiments)}
        >
          {t('nav.experiments')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          aria-current={isWritings ? 'page' : undefined}
          onClick={() => go(hrefWritings)}
        >
          {t('nav.writings')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          aria-current={location.pathname === hrefReading ? 'page' : undefined}
          onClick={() => go(hrefReading)}
        >
          {t('nav.reading')}
        </button>
        <button
          type="button"
          className="mobile-menu__close"
          onClick={() => setMenuOpen(false)}
        >
          {t('nav.close')}
        </button>
      </div>
    </div>
  )
}
