import { Link } from 'react-router-dom'

import { ExperimentCollage } from '@/components/experiments/ExperimentCollage'
import { HomePanel } from '@/components/HomePanel'
import { useI18n } from '@/contexts/I18nContext'
import { homeExperiments } from '@/data/experimentsData'
import { HOME_SLOTS } from '@/data/experimentsCollage'
import { hrefExperiments } from '@/i18n/routes'

const HOME_EXPERIMENTS_PREVIEW_COUNT = 9

export function HomeExperimentsSection() {
  const { t } = useI18n()
  const previewItems = homeExperiments.slice(0, HOME_EXPERIMENTS_PREVIEW_COUNT)

  return (
    <HomePanel
      id="experiments"
      theme="experiments"
      className="home-experiments"
      aria-labelledby="experiments-heading"
    >
      <div className="home-experiments__scroll-shift">
        {previewItems.length > 0 ? (
          <ExperimentCollage
            items={previewItems}
            slots={HOME_SLOTS}
            className="home-experiments__collage"
            ariaLabel={t('pages.home.experimentsGridAria')}
            overlay={
              <header className="home-experiments__header" data-home-reveal-content>
                <h2 id="experiments-heading" className="home-experiments__heading">
                  {t('pages.home.experimentsHeading')}
                </h2>
                <Link className="home-experiments__all" to={hrefExperiments}>
                  {t('pages.home.experimentsAll')}
                </Link>
              </header>
            }
          />
        ) : (
          <div className="home-experiments__empty-wrap">
            <h2 id="experiments-heading" className="home-experiments__heading">
              {t('pages.home.experimentsHeading')}
            </h2>
            <p className="home-experiments__empty">{t('pages.home.experimentsEmpty')}</p>
          </div>
        )}
      </div>
    </HomePanel>
  )
}
