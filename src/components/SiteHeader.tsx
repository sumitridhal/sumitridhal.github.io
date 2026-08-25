import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { useI18n } from '@/contexts/I18nContext'
import { useAppState } from '@/contexts/AppStateContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  hrefAbout,
  hrefHome,
  hrefReading,
  hrefWritings,
} from '@/i18n/routes'
import { useLocation } from 'react-router-dom'

/**
 * Frosted glass layers. The backdrop extends past the header and is masked back
 * so nearby content still feeds the blur; the edge is a second, differently
 * filtered sliver that reads as the thickness of the glass.
 */
function HeaderGlass() {
  return (
    <>
      <div className="site-header__backdrop" aria-hidden="true" />
      <div className="site-header__backdrop-edge" aria-hidden="true" />
    </>
  )
}

export function SiteHeader() {
  const { t } = useI18n()
  const { menuOpen, toggleMenu } = useAppState()
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const isHomeRoute = location.pathname === hrefHome

  if (isHomeRoute) {
    return (
      <header className="site-header site-header--home">
        <div className="site-header__controls">
          <ThemeToggle className="theme-toggle--chip" />
        </div>
      </header>
    )
  }

  return (
    <header className="site-header">
      <HeaderGlass />
      <nav className="site-header__nav" aria-label="Primary">
        <button type="button" className="site-header__link" onClick={() => navigate(hrefHome)}>
          {t('nav.home')}
        </button>
        <button type="button" className="site-header__link" onClick={() => navigate(hrefAbout)}>
          {t('nav.about')}
        </button>
        <button type="button" className="site-header__link" onClick={() => navigate(hrefWritings)}>
          {t('nav.writings')}
        </button>
        <button type="button" className="site-header__link" onClick={() => navigate(hrefReading)}>
          {t('nav.reading')}
        </button>
      </nav>
      <div className="site-header__controls">
        <ThemeToggle />
        <button
          type="button"
          className="site-header__burger"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu-panel"
          onClick={toggleMenu}
        >
          {t('nav.menu')}
        </button>
      </div>
    </header>
  )
}
