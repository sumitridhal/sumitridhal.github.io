import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { excerptFromWriting, writings, writingTitle } from '@/data/writingsData'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { hrefAbout, hrefHome, hrefWriting, hrefWritings } from '@/i18n/routes'

export function SiteFooter() {
  const { t } = useI18n()
  const navigate = useViewTransitionNavigate()
  const latest = useMemo(
    () => writings.find((w) => w.pinInFooter) ?? writings[0],
    [],
  )
  const footerCoverSrc = latest?.footerCoverSrc ?? latest?.coverSrc

  const excerpt = useMemo(
    () => (latest ? excerptFromWriting(latest) : ''),
    [latest],
  )
  const title = latest ? writingTitle(latest) : ''

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
                <Link className="site-footer__link" to={{ pathname: hrefHome, hash: 'work' }}>
                  {t('pages.footer.linkWork')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to={{ pathname: hrefHome, hash: 'experiments' }}>
                  {t('pages.footer.linkExperiments')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to={hrefWritings}>
                  {t('pages.footer.linkWritings')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="site-footer__link site-footer__link--button"
                  onClick={() => navigate(hrefAbout)}
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
                  onClick={() => navigate(hrefAbout)}
                >
                  {t('pages.footer.linkAbout')}
                </button>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={{ pathname: hrefHome, hash: 'work' }}>
                  {t('pages.footer.linkWork')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={{ pathname: hrefHome, hash: 'experiments' }}>
                  {t('pages.footer.linkExperiments')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={hrefWritings}>
                  {t('pages.footer.linkWritings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="site-footer__band site-footer__band--lower">
        <div className="site-footer__inner site-footer__grid site-footer__grid--lower">
          {latest ? (
            <Link
              className={`site-footer__visual${footerCoverSrc ? ' site-footer__visual--cover' : ''}`}
              to={hrefWriting(latest.id)}
              aria-label={title}
            >
              {footerCoverSrc ? (
                <img
                  className={`site-footer__visual-img${latest.footerCoverSrc ? ' site-footer__visual-img--poster' : ''}`}
                  src={footerCoverSrc}
                  alt=""
                  width={960}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="site-footer__visual-mark">SR</span>
              )}
            </Link>
          ) : (
            <div className="site-footer__visual" aria-hidden>
              <span className="site-footer__visual-mark">SR</span>
            </div>
          )}

          <div className="site-footer__col site-footer__col--blog">
            <h2 className="site-footer__heading site-footer__heading--invert site-footer__heading--serif">
              {t('pages.footer.latestHeading')}
            </h2>
            {latest ? (
              <>
                <p className="site-footer__post-title">{title}</p>
                {excerpt ? <p className="site-footer__excerpt">{excerpt}</p> : null}
                <Link className="site-footer__cta" to={hrefWriting(latest.id)}>
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
