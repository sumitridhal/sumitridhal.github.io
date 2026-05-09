import { useEffect, useRef, useState, type SVGProps } from 'react'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { useI18n } from '@/contexts/I18nContext'
import { useAppState } from '@/contexts/AppStateContext'
import {
  aboutSegment,
  hrefHome,
  locales,
  type Locale,
} from '@/i18n/routes'
import { useLocation } from 'react-router-dom'

const localeLabels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  hi: 'हिन्दी',
}

function LangIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

export function SiteHeader() {
  const { locale, t } = useI18n()
  const { menuOpen, toggleMenu } = useAppState()
  const navigate = useViewTransitionNavigate()
  const location = useLocation()
  const [langOpen, setLangOpen] = useState(false)
  const langWrapRef = useRef<HTMLDivElement>(null)
  const isHomeRoute = new RegExp(`^/(${locales.join('|')})/?$`).test(
    location.pathname,
  )

  useEffect(() => {
    if (!langOpen) return
    const onDocDown = (e: MouseEvent) => {
      if (!langWrapRef.current?.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [langOpen])

  useEffect(() => {
    setLangOpen(false)
  }, [location.pathname])

  if (isHomeRoute) {
    return (
      <header className="site-header site-header--home">
        <div className="site-header__lang" ref={langWrapRef}>
          <button
            id="site-header-lang-trigger"
            type="button"
            className={`site-header__lang-toggle${langOpen ? ' is-open' : ''}`}
            aria-expanded={langOpen}
            aria-haspopup="true"
            aria-controls="site-header-lang-panel"
            aria-label={t('nav.langMenu')}
            onClick={() => setLangOpen((o) => !o)}
          >
            <LangIcon className="site-header__lang-icon" />
          </button>
          <div
            id="site-header-lang-panel"
            className={`site-header__lang-panel${langOpen ? ' is-open' : ''}`}
            role="menu"
            aria-labelledby="site-header-lang-trigger"
          >
            {locales.map((item) => (
              <button
                key={item}
                type="button"
                role="menuitem"
                className={`site-header__lang-option${item === locale ? ' is-active' : ''}`}
                onClick={() => {
                  navigate(hrefHome(item))
                  setLangOpen(false)
                }}
              >
                <span className="site-header__lang-option-label">
                  {localeLabels[item]}
                </span>
                <span className="site-header__lang-option-code">
                  {item.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="site-header">
      <button
        type="button"
        className="site-header__brand"
        onClick={() => navigate(hrefHome(locale))}
      >
        {t('common.brand')}
      </button>
      <nav className="site-header__nav" aria-label="Primary">
        <button
          type="button"
          className="site-header__link"
          onClick={() => navigate(hrefHome(locale))}
        >
          {t('nav.home')}
        </button>
        <button
          type="button"
          className="site-header__link"
          onClick={() => navigate(`/${locale}/${aboutSegment(locale)}`)}
        >
          {t('nav.about')}
        </button>
        <button
          type="button"
          className="site-header__link"
          onClick={() =>
            navigate({ pathname: hrefHome(locale), hash: 'work' })
          }
        >
          {t('nav.work')}
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
