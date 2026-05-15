import type { RefObject } from 'react'
import { Link } from 'react-router-dom'

import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { useI18n } from '@/contexts/I18nContext'
import { homeExperiments } from '@/data/experimentsData'

type HomeExperimentsSectionProps = {
  trackRef?: RefObject<HTMLDivElement | null>
  stripRef?: RefObject<HTMLUListElement | null>
  /** Transform-driven strip (linked scroll timeline). Otherwise native horizontal scroll. */
  scrubHorizontal?: boolean
}

export function HomeExperimentsSection({
  trackRef,
  stripRef,
  scrubHorizontal = false,
}: HomeExperimentsSectionProps) {
  const { t } = useI18n()

  return (
    <HomePanel
      id="experiments"
      theme="experiments"
      className="home-experiments"
      backgroundImage={HOME_SECTION_BANNERS.experiments}
      aria-labelledby="experiments-heading"
    >
      <HomeSlideLayout
        titleId="experiments-heading"
        title={t('pages.home.experimentsHeading')}
        lead={t('pages.home.experimentsLead')}
      >
        <p className="home-experiments__note" data-home-reveal>
          {t('pages.home.experimentsStripNote')}
        </p>
        {homeExperiments.length === 0 ? (
          <p className="home-experiments__empty">{t('pages.home.experimentsEmpty')}</p>
        ) : (
          <div
            ref={trackRef}
            className={`home-experiments__track${scrubHorizontal ? ' home-experiments__track--scrub' : ''}`}
          >
            <ul
              ref={stripRef}
              className="home-experiments__grid"
              role="list"
              aria-label={t('pages.home.experimentsGridAria')}
            >
            {homeExperiments.map((item) => {
              const caption = (
                <>
                  <span className="home-experiments__title">{item.title}</span>
                  {item.tag ? <span className="home-experiments__tag">{item.tag}</span> : null}
                </>
              )
              const media = (
                <div className="home-experiments__frame">
                  <img
                    className="home-experiments__image"
                    src={item.mediaSrc}
                    alt={item.alt}
                    width={512}
                    height={512}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              )

              return (
                <li key={item.id} className="home-experiments__cell" data-home-reveal role="listitem">
                  {item.href ? (
                    item.href.startsWith('http') ? (
                      <a
                        className="home-experiments__tile"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {media}
                        <span className="home-experiments__caption">{caption}</span>
                      </a>
                    ) : (
                      <Link className="home-experiments__tile" to={item.href}>
                        {media}
                        <span className="home-experiments__caption">{caption}</span>
                      </Link>
                    )
                  ) : (
                    <div className="home-experiments__tile home-experiments__tile--static">
                      {media}
                      <span className="home-experiments__caption">{caption}</span>
                    </div>
                  )}
                </li>
              )
            })}
            </ul>
          </div>
        )}
      </HomeSlideLayout>
    </HomePanel>
  )
}
