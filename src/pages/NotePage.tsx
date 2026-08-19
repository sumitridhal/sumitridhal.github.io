import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { getNoteEntryBySlug } from '@/data/notesRegistry'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { hrefNotes } from '@/i18n/routes'
import { formatWritingDate } from '@/utils/formatWritingDate'

export function NotePage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useI18n()
  const navigate = useViewTransitionNavigate()
  const entry = useMemo(() => getNoteEntryBySlug(slug), [slug])

  if (!slug || !entry) {
    return <Navigate to={hrefNotes} replace />
  }

  const { meta, Body } = entry

  return (
    <article className="writing-page note-page">
      <div className="writing-page__toolbar">
        <button
          type="button"
          className="writing-page__back"
          onClick={() => navigate(hrefNotes)}
        >
          {t('pages.notes.back')}
        </button>
        <p className="writing-page__meta">
          <span className="writing-page__date">{formatWritingDate(meta.date)}</span>
          <span className="writing-page__tag">{meta.category}</span>
        </p>
      </div>

      <header className="writing-page__hero">
        <h1 className="writing-page__headline">{meta.title}</h1>
        <p className="note-page__source">{t('pages.notes.sourceLabel')}: {meta.source}</p>
      </header>

      <div className="writing-page__grid writing-page__grid--single">
        <div className="writing-page__main">
          <div className="writing-page__body">
            <Body />
          </div>
        </div>
      </div>
    </article>
  )
}
