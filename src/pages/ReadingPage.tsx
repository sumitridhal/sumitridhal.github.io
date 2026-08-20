import { useI18n } from '@/contexts/I18nContext'
import { readingItems } from '@/data/readingData'
import { formatWritingDate } from '@/utils/formatWritingDate'

const aggregatorFieldsOnly =
  /^(?:(?:article|comments) url\s*:\s*\S+\s*|(?:points|# comments)\s*:\s*\d+\s*)+$/i

function normalizeCopy(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function shouldShowBlurb(title: string, blurb: string | undefined): blurb is string {
  if (!blurb) return false

  const trimmedBlurb = blurb.trim()
  if (!trimmedBlurb || /^article url\s*:/i.test(trimmedBlurb)) return false
  if (aggregatorFieldsOnly.test(trimmedBlurb)) return false

  const normalizedTitle = normalizeCopy(title)
  const normalizedBlurb = normalizeCopy(trimmedBlurb)
  if (!normalizedTitle || !normalizedBlurb) return false

  return (
    !normalizedTitle.startsWith(normalizedBlurb) &&
    !normalizedBlurb.startsWith(normalizedTitle)
  )
}

export function ReadingPage() {
  const { t } = useI18n()

  return (
    <div className="reading-page">
      <header className="reading-page__header">
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
                  {shouldShowBlurb(item.title, item.blurb) ? (
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
