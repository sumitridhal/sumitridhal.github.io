import { Link } from 'react-router-dom'

import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { useI18n } from '@/contexts/I18nContext'
import { homeExperiments } from '@/data/experimentsData'

export function HomeExperimentsSection() {
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
        {homeExperiments.length === 0 ? (
          <p className="home-experiments__empty">{t('pages.home.experimentsEmpty')}</p>
        ) : (
          <ul className="home-experiments__grid" role="list" aria-label={t('pages.home.experimentsGridAria')}>
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
        )}
      </HomeSlideLayout>
    </HomePanel>
  )
}
