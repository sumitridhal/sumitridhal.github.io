import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import {
  paragraphsForWriting,
  writings,
  type WritingItem,
} from '@/data/writingsData'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { hrefAbout, hrefHome, hrefWriting, type Locale } from '@/i18n/routes'

function writingTitle(item: WritingItem, locale: Locale): string {
  const localized = item.title[locale]
  if (localized.trim()) return localized
  return item.title.en
}

function excerptFromWriting(item: WritingItem, locale: Locale): string {
  const p = paragraphsForWriting(item, locale)[0] ?? ''
  if (!p) return ''
  const max = 220
  if (p.length <= max) return p
  const slice = p.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 80 ? slice.slice(0, lastSpace) : slice
  return `${cut.trimEnd()}…`
}

export function SiteFooter() {
  const { locale, t } = useI18n()
  const navigate = useViewTransitionNavigate()
  const latest = writings[0]

  const home = hrefHome(locale)
  const excerpt = useMemo(
    () => (latest ? excerptFromWriting(latest, locale) : ''),
    [latest, locale],
  )
  const title = latest ? writingTitle(latest, locale) : ''

  return (
    <footer className="site-footer">
      <div className="site-footer__band site-footer__band--upper">
        <div className="site-footer__inner site-footer__grid site-footer__grid--upper">
          <div className="site-footer__col site-footer__col--brand">
            <p className="site-footer__brand">{t('common.brand')}</p>
            <p className="site-footer__role">{t('common.tagline')}</p>
            <p className="site-footer__intro">{t('pages.footer.intro')}</p>
          </div>

          <div className="site-footer__col site-footer__col--explore">
            <h2 className="site-footer__heading site-footer__heading--serif">
              {t('pages.footer.exploreHeading')}
            </h2>
            <ul className="site-footer__list" role="list">
              <li>
                <Link className="site-footer__link" to={{ pathname: home, hash: 'work' }}>
                  {t('pages.footer.linkWork')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to={{ pathname: home, hash: 'writings' }}>
                  {t('pages.footer.linkWritings')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="site-footer__link site-footer__link--button"
                  onClick={() => navigate(hrefAbout(locale))}
                >
                  {t('pages.footer.linkAbout')}
                </button>
              </li>
            </ul>
            <p className="site-footer__meta">{t('pages.footer.tagline')}</p>
          </div>

          <nav
            className="site-footer__col site-footer__col--nav"
            aria-label={t('pages.footer.exploreHeading')}
          >
            <ul className="site-footer__nav-list" role="list">
              <li>
                <button
                  type="button"
                  className="site-footer__nav-link"
                  onClick={() => navigate(hrefAbout(locale))}
                >
                  {t('pages.footer.linkAbout')}
                </button>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={{ pathname: home, hash: 'work' }}>
                  {t('pages.footer.linkWork')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={{ pathname: home, hash: 'writings' }}>
                  {t('pages.footer.linkWritings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="site-footer__band site-footer__band--lower">
        <div className="site-footer__inner site-footer__grid site-footer__grid--lower">
          <div className="site-footer__visual" aria-hidden>
            <span className="site-footer__visual-mark">SR</span>
          </div>

          <div className="site-footer__col site-footer__col--blog">
            <h2 className="site-footer__heading site-footer__heading--invert site-footer__heading--serif">
              {t('pages.footer.latestHeading')}
            </h2>
            {latest ? (
              <>
                <p className="site-footer__post-title">{title}</p>
                {excerpt ? <p className="site-footer__excerpt">{excerpt}</p> : null}
                <Link
                  className="site-footer__cta"
                  to={hrefWriting(locale, latest.id)}
                >
                  {t('pages.footer.readPostCta')}
                </Link>
              </>
            ) : (
              <p className="site-footer__excerpt">{t('pages.footer.emptyWritings')}</p>
            )}
          </div>

          <div className="site-footer__col site-footer__col--social">
            <h2 className="site-footer__heading site-footer__heading--invert site-footer__heading--serif">
              {t('pages.footer.elsewhereHeading')}
            </h2>
            <ul className="site-footer__external" role="list">
              <li>
                <a
                  className="site-footer__external-link"
                  href={t('pages.footer.social.githubHref')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('pages.footer.social.githubLabel')}
                </a>
              </li>
              <li>
                <a
                  className="site-footer__external-link"
                  href={t('pages.footer.social.linkedinHref')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('pages.footer.social.linkedinLabel')}
                </a>
              </li>
            </ul>
            <a
              className="site-footer__external-link site-footer__external-link--solo"
              href={t('pages.footer.social.viewAllHref')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('pages.footer.social.viewAll')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
