import { useEffect, useRef } from 'react'
import type { To } from 'react-router-dom'

import { useAppState } from '@/contexts/AppStateContext'
import { useI18n } from '@/contexts/I18nContext'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { aboutSegment, hrefHome } from '@/i18n/routes'

export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useAppState()
  const { locale, t } = useI18n()
  const navigate = useViewTransitionNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

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
        <button type="button" className="mobile-menu__link" onClick={() => go(hrefHome(locale))}>
          {t('nav.home')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          onClick={() => go(`/${locale}/${aboutSegment(locale)}`)}
        >
          {t('nav.about')}
        </button>
        <button
          type="button"
          className="mobile-menu__link"
          onClick={() => go({ pathname: hrefHome(locale), hash: 'work' })}
        >
          {t('nav.work')}
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
