import { useRef, type CSSProperties } from 'react'

import { useI18n } from '@/contexts/I18nContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSectionsScrollExperience } from '@/hooks/useSectionsScrollExperience'

const OA_HERO_LEFT_IMG =
  'https://objectandarchive.com/cdn/shop/files/Etudedeforet.jpg?v=1775498766&width=1200'

const OA_HERO_RIGHT_IMG =
  'https://objectandarchive.com/cdn/shop/files/monet_detail.png?v=1777132945&width=1000'

const INTERIOR_EXPLORE_IMG =
  'https://images.unsplash.com/photo-1615875479889-2fb72aed924c?auto=format&fit=crop&w=720&q=82'

const INTERIOR_STYLE_INDEXES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

const NICHE_THEME_INDEXES = [1, 2, 3, 4, 5, 6] as const

const RESOURCES_CENTER_IMG = '/media/sections/resources-center-photo.png'

const OBS_FRAME_ROTATION = ['notched', 'scallop-black', 'scallop-wood'] as const

/** Section 2 gallery — Current Obsessions (3 tiles, CDN). */
const STYLE_PREVIEW_TILES = [
  {
    label: 'Modern Folk',
    caption:
      'Hand-thrown forms, linen, and quiet pattern. Art that feels gathered over seasons rather than staged overnight.',
    image:
      'https://objectandarchive.com/cdn/shop/files/oa-custom-5.png?v=1776609699&width=900',
  },
  {
    label: 'Cottagecore',
    caption:
      'Soft daylight, hedgerow greens, and small domestic joys. Pieces read like pressed flowers in a commonplace book.',
    image:
      'https://objectandarchive.com/cdn/shop/files/indianer_du_nord.png?v=1775327543&width=900',
  },
  {
    label: 'Cosmic Feminine',
    caption:
      'Lunar palettes, veils of pigment, and slow orbit. Work that tilts toward myth without losing a human scale.',
    image:
      'https://objectandarchive.com/cdn/shop/files/man_of_confusion_22dd0388-3c82-47b3-a8cc-d33b535c249b.png?v=1775328526&width=900',
  },
] as const

const OA_FOOTER_COLUMNS = [
  {
    titleKey: 'footerColShopTitle',
    linkKeys: ['footerColShop1', 'footerColShop2', 'footerColShop3'],
  },
  {
    titleKey: 'footerColInfoTitle',
    linkKeys: [
      'footerColInfo1',
      'footerColInfo2',
      'footerColInfo3',
      'footerColInfo4',
      'footerColInfo5',
    ],
  },
  {
    titleKey: 'footerColConnectTitle',
    linkKeys: ['footerColConnect1', 'footerColConnect2', 'footerColConnect3'],
  },
  {
    titleKey: 'footerColEtcTitle',
    linkKeys: [
      'footerColEtc1',
      'footerColEtc2',
      'footerColEtc3',
      'footerColEtc4',
      'footerColEtc5',
    ],
  },
] as const

export function SectionsPage() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  const articleRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useSectionsScrollExperience(articleRef, reducedMotion)

  return (
    <article id="sections-page-top" ref={articleRef} className="sections-page">
      <main className="sections-page__main">
        <section
          id="section-1"
          className="sections-page__section sections-page__section--oa-hero"
          aria-labelledby="sections-page-heading-1"
        >
          <div className="oa-hero">
            <div className="oa-hero__backdrop" aria-hidden="true" />

            <div className="oa-hero__split">
              <div
                className="oa-hero__col oa-hero__col--left"
                style={
                  {
                    '--oa-hero-panel-bg-image': `url("${OA_HERO_LEFT_IMG}")`,
                  } as CSSProperties
                }
              >
                <p className="oa-hero__caption">{t('pages.sections.oaCaption')}</p>
              </div>
              <div
                className="oa-hero__col oa-hero__col--right"
                style={
                  {
                    '--oa-hero-panel-bg-image': `url("${OA_HERO_RIGHT_IMG}")`,
                  } as CSSProperties
                }
              >
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

        <section
          id="section-2"
          className="sections-page__section sections-page__section--obsessions"
          aria-labelledby="sections-page-heading-2"
        >
          <div className="obsessions">
            <header className="obsessions__header">
              <div className="obsessions__intro">
                <h2 id="sections-page-heading-2" className="obsessions__title">
                  {t('pages.sections.obsHeading')}
                </h2>
                <p className="obsessions__lead">{t('pages.sections.obsLead')}</p>
              </div>
              <a className="obsessions__cta" href="#section-2">
                {t('pages.sections.obsCta')}
              </a>
            </header>

            <ul className="obsessions__gallery">
              {STYLE_PREVIEW_TILES.map((style, index) => {
                const frame = OBS_FRAME_ROTATION[index % OBS_FRAME_ROTATION.length]
                return (
                  <li key={style.label} className="obsessions__tile">
                    <figure className="obsessions__figure">
                      <div className={`obs-frame obs-frame--${frame}`}>
                        <div className="obs-frame__mat">
                          <div className="obs-frame__img-wrap">
                            <img
                              className="obs-frame__img"
                              src={style.image}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              width={720}
                              height={900}
                            />
                          </div>
                        </div>
                      </div>
                      <figcaption className="obsessions__caption">
                        <span className="obsessions__work-title">{style.label}</span>
                        <p className="obsessions__tile-caption">{style.caption}</p>
                      </figcaption>
                    </figure>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section
          id="section-3"
          className="sections-page__section sections-page__section--mood-movement"
          aria-labelledby="sections-page-heading-3"
        >
          <div className="mood-panel">

            <div className="mood-panel__layout">
              <div className="mood-panel__content">
                <div className="mood-panel__copy">
                  <p className="mood-panel__crumb">{t('pages.sections.moodCrumb')}</p>
                  <p id="sections-page-heading-3" className="mood-panel__statement">
                    {t('pages.sections.moodStatement')}
                  </p>
                  <a href="#section-3" className="mood-panel__story">
                    {t('pages.sections.moodStory')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="section-4"
          className="sections-page__section sections-page__section--interior-explore"
          aria-labelledby="sections-page-heading-4"
        >
          <div className="interior-explore">
            <div className="interior-explore__body">
              <div className="interior-explore__list-col">
                <h2 id="sections-page-heading-4" className="interior-explore__heading">
                  {t('pages.sections.interiorExploreHeading')}
                </h2>
                <ul className="interior-explore__styles">
                  {INTERIOR_STYLE_INDEXES.map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        className={`interior-explore__style-btn${n === 1 ? ' is-active' : ''}`}
                        aria-current={n === 1 ? 'true' : undefined}
                      >
                        {t(`pages.sections.interiorStyle${n}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="interior-explore__figure">
                <img
                  className="interior-explore__photo"
                  src={INTERIOR_EXPLORE_IMG}
                  alt={t('pages.sections.interiorExploreImgAlt')}
                  loading="lazy"
                  decoding="async"
                  width={720}
                  height={900}
                />
                <figcaption className="interior-explore__desc">
                  {t('pages.sections.interiorExploreDesc')}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          id="section-5"
          className="sections-page__section sections-page__section--niche-strange"
          aria-labelledby="sections-page-heading-5"
        >
          <div className="niche-panel">
            <div className="niche-panel__scrim" aria-hidden="true" />

            <div className="niche-panel__layout">
              <div className="niche-panel__sidebar">
                <h2 id="sections-page-heading-5" className="niche-panel__sidebar-heading">
                  {t('pages.sections.nicheStrangeHeading')}
                </h2>
                <ul
                  className="niche-panel__themes"
                  role="radiogroup"
                  aria-labelledby="sections-page-heading-5"
                >
                  {NICHE_THEME_INDEXES.map((n) => (
                    <li key={n} className="niche-panel__theme-item">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={n === 1 ? true : false}
                        className={`niche-panel__theme${n === 1 ? ' is-selected' : ''}`}
                      >
                        <span className="niche-panel__theme-indicator" aria-hidden="true" />
                        <span className="niche-panel__theme-label">
                          {t(`pages.sections.nicheTheme${n}`)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="niche-panel__main">
                <p className="niche-panel__body">{t('pages.sections.nicheBody')}</p>
                <a href="#section-5" className="niche-panel__cta">
                  {t('pages.sections.nicheCta')}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="section-6"
          className="sections-page__section sections-page__section--resources-feature"
          aria-labelledby="sections-page-heading-6"
        >
          <div className="resources-feature">
            <div className="resources-feature__stage">
              <div className="resources-feature__watermark" aria-hidden="true">
                <span className="resources-feature__watermark-line">
                  {t('pages.sections.resourcesBgLine1')}
                </span>
                <span className="resources-feature__watermark-line">
                  {t('pages.sections.resourcesBgLine2')}
                </span>
              </div>

              <figure className="resources-feature__figure">
                <h2 id="sections-page-heading-6" className="resources-feature__figure-kicker">
                  {t('pages.sections.resourcesFeatureKicker')}
                </h2>
                <img
                  className="resources-feature__photo"
                  src={RESOURCES_CENTER_IMG}
                  alt={t('pages.sections.resourcesImgAlt')}
                  loading="lazy"
                  decoding="async"
                  width={760}
                  height={1140}
                />
              </figure>

              <p className="resources-feature__desc">{t('pages.sections.resourcesDesc')}</p>
            </div>
          </div>
        </section>

        <section
          id="section-7"
          className="sections-page__section sections-page__section--newsletter-still-life"
          aria-labelledby="sections-page-heading-7"
        >
          <div className="newsletter-panel">
            <div className="newsletter-panel__backdrop" aria-hidden="true" />

            <div className="newsletter-panel__center">
              <div className="newsletter-panel__card">
                <h2 id="sections-page-heading-7" className="newsletter-panel__title">
                  {t('pages.sections.newsletterHeading')}
                </h2>
                <p className="newsletter-panel__body">{t('pages.sections.newsletterBody')}</p>
                <p className="newsletter-panel__offer">{t('pages.sections.newsletterOffer')}</p>

                <form
                  className="newsletter-panel__form"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                >
                  <button type="submit" className="newsletter-panel__submit">
                    {t('pages.sections.newsletterCta')}
                  </button>
                  <div className="newsletter-panel__field">
                    <label htmlFor="newsletter-email-7" className="newsletter-panel__label-sr">
                      {t('pages.sections.newsletterEmailLabel')}
                    </label>
                    <input
                      id="newsletter-email-7"
                      className="newsletter-panel__input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder={t('pages.sections.newsletterPlaceholder')}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sections-page__footer">
        <section
          id="section-8"
          className="sections-page__section sections-page__section--oa-footer"
          aria-labelledby="sections-page-heading-8"
        >
          <div className="oa-footer">
            <h2 id="sections-page-heading-8" className="oa-footer__sr-only">
              {t('pages.sections.footerSectionHeading')}
            </h2>

            <div className="oa-footer__cols">
              {OA_FOOTER_COLUMNS.map((col) => (
                <div key={col.titleKey} className="oa-footer__col">
                  <h3 className="oa-footer__col-title">{t(`pages.sections.${col.titleKey}`)}</h3>
                  <ul className="oa-footer__links">
                    {col.linkKeys.map((linkKey) => (
                      <li key={linkKey}>
                        <a className="oa-footer__link" href="#section-8">
                          {t(`pages.sections.${linkKey}`)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="oa-footer__mid">
              <div className="oa-footer__note-block">
                <p className="oa-footer__tagline">{t('pages.sections.footerTagline')}</p>
                <p className="oa-footer__copyright">
                  © {year}, {t('pages.sections.footerCopyrightBrand')}
                </p>
              </div>

              <a className="oa-footer__top" href="#sections-page-top">
                {t('pages.sections.footerBackToTop')}
              </a>

              <button type="button" className="oa-footer__square" aria-label={t('pages.sections.footerSquareAria')} />
            </div>

            <p className="oa-footer__mega" aria-hidden="true">
              Object & Archive
            </p>
          </div>
        </section>
      </footer>
    </article>
  )
}
