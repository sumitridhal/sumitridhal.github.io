import { Link } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import {
  hrefAbout,
  hrefExperiments,
  hrefHome,
  hrefReading,
  hrefWritings,
} from '@/i18n/routes'

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="site-footer__band">
        <div className="site-footer__inner site-footer__grid">
          <div className="site-footer__col site-footer__col--brand">
            <p className="site-footer__brand">{t('common.brand')}</p>
            <p className="site-footer__intro">{t('pages.footer.intro')}</p>
          </div>

          <nav className="site-footer__col site-footer__col--nav" aria-label={t('nav.menu')}>
            <ul className="site-footer__nav-list" role="list">
              <li>
                <Link className="site-footer__nav-link" to={hrefHome}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={hrefAbout}>
                  {t('pages.footer.linkAbout')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={hrefWritings}>
                  {t('pages.footer.linkWritings')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={hrefReading}>
                  {t('pages.footer.linkReading')}
                </Link>
              </li>
              <li>
                <Link className="site-footer__nav-link" to={hrefExperiments}>
                  {t('pages.footer.linkExperiments')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="site-footer__col site-footer__col--social">
            <h2 className="site-footer__heading">
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
          </div>
        </div>
      </div>
    </footer>
  )
}
