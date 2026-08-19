import { useI18n } from '@/contexts/I18nContext'
import { readingItems } from '@/data/readingData'
import { formatWritingDate } from '@/utils/formatWritingDate'

export function ReadingPage() {
  const { t } = useI18n()

  return (
    <div className="reading-page">
      <header className="reading-page__header">
        <p className="reading-page__kicker">{t('pages.reading.category')}</p>
        <h1 className="reading-page__title">{t('pages.reading.title')}</h1>
        <p className="reading-page__lead">{t('pages.reading.lead')}</p>
      </header>

      {readingItems.length === 0 ? (
        <p className="reading-page__empty">{t('pages.reading.empty')}</p>
      ) : (
        <ul className="reading-page__list">
          {readingItems.map((item) => (
            <li key={item.id} className="reading-page__item">
              <a
                className="reading-page__link"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.imageSrc ? (
                  <img
                    className="reading-page__image"
                    src={item.imageSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="reading-page__content">
                  <span className="reading-page__meta">
                    <span>{item.source}</span>
                    {item.date ? <span>{formatWritingDate(item.date)}</span> : null}
                    <span>{item.tag}</span>
                  </span>
                  <span className="reading-page__item-title">{item.title}</span>
                  {item.blurb ? (
                    <span className="reading-page__blurb">{item.blurb}</span>
                  ) : null}
                </span>
                <span className="reading-page__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
