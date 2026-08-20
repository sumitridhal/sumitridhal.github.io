import { ExperimentCollage } from '@/components/experiments/ExperimentCollage'
import { useI18n } from '@/contexts/I18nContext'
import { homeExperiments } from '@/data/experimentsData'
import { PAGE_SLOTS } from '@/data/experimentsCollage'

export function ExperimentsPage() {
  const { t } = useI18n()

  return (
    <div className="experiments-page">
      {homeExperiments.length > 0 ? (
        <ExperimentCollage
          items={homeExperiments}
          slots={PAGE_SLOTS}
          className="experiments-page__collage"
          ariaLabel={t('pages.home.experimentsGridAria')}
          overlay={
            <header className="experiments-page__header">
              <p className="experiments-page__kicker">{t('pages.experiments.kicker')}</p>
              <h1 className="experiments-page__title">{t('pages.experiments.title')}</h1>
              <p className="experiments-page__lead">{t('pages.experiments.lead')}</p>
            </header>
          }
        />
      ) : (
        <div className="experiments-page__empty-wrap">
          <h1 className="experiments-page__title">{t('pages.experiments.title')}</h1>
          <p className="experiments-page__empty">{t('pages.experiments.empty')}</p>
        </div>
      )}
    </div>
  )
}
