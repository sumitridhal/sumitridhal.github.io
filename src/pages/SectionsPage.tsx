import { useI18n } from '@/contexts/I18nContext'

const SECTION_INDEXES = [1, 2, 3, 4, 5, 6, 7, 8] as const

export function SectionsPage() {
  const { t } = useI18n()

  return (
    <article className="sections-page">
      <header className="sections-page__hero">
        <p className="sections-page__kicker">{t('pages.sections.kicker')}</p>
        <h1 className="sections-page__title">{t('pages.sections.title')}</h1>
        <p className="sections-page__lead">{t('pages.sections.lead')}</p>
      </header>

      <div className="sections-page__sections">
        {SECTION_INDEXES.map((n) => (
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
    </article>
  )
}
