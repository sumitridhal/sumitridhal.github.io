import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import {
  getWritingBySlug,
  paragraphsForWriting,
} from '@/data/writingsData'
import { hrefHome } from '@/i18n/routes'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'

export function WritingPage() {
  const { slug } = useParams<{ slug: string }>()
  const { locale, t } = useI18n()
  const navigate = useViewTransitionNavigate()

  const writing = useMemo(() => getWritingBySlug(slug), [slug])
  const paragraphs = useMemo(
    () => (writing ? paragraphsForWriting(writing, locale) : []),
    [writing, locale],
  )

  if (!slug || !writing) {
    return (
      <Navigate
        to={{ pathname: hrefHome(locale), hash: 'writings' }}
        replace
      />
    )
  }

  return (
    <article className="writing-page">
      <button
        type="button"
        className="writing-page__back"
        onClick={() =>
          navigate({ pathname: hrefHome(locale), hash: 'writings' })
        }
      >
        {t('pages.writing.back')}
      </button>
      <p className="writing-page__meta">
        <span className="writing-page__date">{writing.date}</span>
        <span className="writing-page__tag">{writing.category}</span>
      </p>
      <h1 className="writing-page__title">{writing.title[locale]}</h1>
      <div className="writing-page__body">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}
