import { useI18n } from '@/contexts/I18nContext'

const OA_HERO_BG = '/media/sections/oa-hero.png'

const OA_NAV_LEFT = ['Shop', 'Gift art', 'Resources', 'Info'] as const
const OA_NAV_RIGHT = ['Search', 'Cart', 'Log in', '$ USD'] as const

const SECTION_REST_INDEXES = [2, 3, 4, 5, 6, 7, 8] as const

export function SectionsPage() {
  const { t } = useI18n()

  return (
    <article className="sections-page">
      <header className="sections-page__intro">
        <p className="sections-page__kicker">{t('pages.sections.kicker')}</p>
        <h1 className="sections-page__title">{t('pages.sections.title')}</h1>
        <p className="sections-page__lead">{t('pages.sections.lead')}</p>
      </header>

      <div className="sections-page__sections">
        <section
          id="section-1"
          className="sections-page__section sections-page__section--oa-hero"
          aria-labelledby="sections-page-heading-1"
        >
          <div className="oa-hero">
            <div className="oa-hero__backdrop" aria-hidden="true" />

            <nav className="oa-hero__nav" aria-label="Demo storefront navigation">
              <div className="oa-hero__nav-cluster oa-hero__nav-cluster--left">
                {OA_NAV_LEFT.map((label) => (
                  <a key={label} className="oa-hero__nav-link" href="#section-1">
                    {label}
                  </a>
                ))}
              </div>
              <span className="oa-hero__nav-logo">Object & Archive</span>
              <div className="oa-hero__nav-cluster oa-hero__nav-cluster--right">
                {OA_NAV_RIGHT.map((label) => (
                  <a key={label} className="oa-hero__nav-link" href="#section-1">
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="oa-hero__split">
              <div className="oa-hero__col oa-hero__col--left">
                <p className="oa-hero__caption">{t('pages.sections.oaCaption')}</p>
                <div className="oa-hero__frame">
                  <img src={OA_HERO_BG} alt="" className="oa-hero__frame-img" decoding="async" />
                </div>
              </div>
              <div className="oa-hero__col oa-hero__col--right">
                <h2 id="sections-page-heading-1" className="oa-hero__headline">
                  {t('pages.sections.oaHeadline')}
                </h2>
                <p className="oa-hero__sub">{t('pages.sections.oaSub')}</p>
              </div>
            </div>

            <p className="oa-hero__brand" aria-hidden="true">
              Object & Archive
            </p>
          </div>
        </section>

        <div className="sections-page__sections-inner">
          {SECTION_REST_INDEXES.map((n) => (
            <section
              key={n}
              id={`section-${n}`}
              className="sections-page__section"
              aria-labelledby={`sections-page-heading-${n}`}
            >
              <h2 id={`sections-page-heading-${n}`} className="sections-page__section-title">
                {t(`pages.sections.s${n}Title`)}
              </h2>
              <p className="sections-page__section-body">{t(`pages.sections.s${n}Body`)}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
