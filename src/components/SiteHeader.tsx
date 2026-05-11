import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { useI18n } from '@/contexts/I18nContext'
import { useAppState } from '@/contexts/AppStateContext'
import { hrefAbout, hrefExperiments, hrefHome, hrefWritings } from '@/i18n/routes'
import { useLocation } from 'react-router-dom'

export function SiteHeader() {
  const { t } = useI18n()
  const { menuOpen, toggleMenu } = useAppState()
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const isHomeRoute = location.pathname === hrefHome

  if (isHomeRoute) {
    return <header className="site-header site-header--home" />
  }

  return (
    <header className="site-header">
      <nav className="site-header__nav" aria-label="Primary">
        <button type="button" className="site-header__link" onClick={() => navigate(hrefHome)}>
          {t('nav.home')}
        </button>
        <button type="button" className="site-header__link" onClick={() => navigate(hrefAbout)}>
          {t('nav.about')}
        </button>
        <button
          type="button"
          className="site-header__link"
          onClick={() => navigate({ pathname: hrefHome, hash: 'work' })}
        >
          {t('nav.work')}
        </button>
        <button type="button" className="site-header__link" onClick={() => navigate(hrefWritings)}>
          {t('nav.writings')}
        </button>
        <button
          type="button"
          className="site-header__link"
          onClick={() => navigate(hrefExperiments)}
        >
          {t('nav.experiments')}
        </button>
      </nav>
      <button
        type="button"
        className="site-header__burger"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu-panel"
        onClick={toggleMenu}
      >
        {t('nav.menu')}
      </button>
    </header>
  )
}
