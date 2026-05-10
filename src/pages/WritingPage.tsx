import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import {
  asideParagraphsForWriting,
  getWritingEntryBySlug,
  titleLinesForWriting,
  type WritingFigureVariant,
} from '@/data/writingsData'
import { hrefWritings } from '@/i18n/routes'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'

const figureLabels: Record<WritingFigureVariant, string> = {
  grain: 'High-frequency value noise',
  cloud: 'Smooth gradient noise field',
  flow: 'Flow-field contours',
  branch: 'Layered branching structure',
  grad: 'Base gradient square',
  glow: 'Radial glow before warp',
  warp: 'Displacement by noise',
  mesh: 'Grid distorted by field',
}

export function WritingPage() {
  const { slug } = useParams<{ slug: string }>()
  const { locale, t } = useI18n()
  const navigate = useViewTransitionNavigate()

  const entry = useMemo(() => getWritingEntryBySlug(slug), [slug])
  const writing = entry?.meta
  const Body = entry?.Body
  const titleLines = useMemo(
    () => (writing ? titleLinesForWriting(writing) : []),
    [writing],
  )
  const asideParagraphs = useMemo(
    () => (writing ? asideParagraphsForWriting(writing) : []),
    [writing],
  )
  const figureRows = writing?.figureRows ?? []

  if (!slug || !writing || !Body) {
    return <Navigate to={hrefWritings(locale)} replace />
  }

  const hasAside = asideParagraphs.length > 0
  const hasFigures = figureRows.length > 0

  return (
    <article className="writing-page">
      <div className="writing-page__toolbar">
        <button
          type="button"
          className="writing-page__back"
          onClick={() => navigate(hrefWritings(locale))}
        >
          {t('pages.writing.back')}
        </button>
        <p className="writing-page__meta">
          <span className="writing-page__date">{writing.date}</span>
          <span className="writing-page__tag">{writing.category}</span>
        </p>
      </div>

      <header className="writing-page__hero">
        <h1 className="writing-page__headline">
          {titleLines.map((line, i) => (
            <span key={i} className="writing-page__headline-line">
              {line}
            </span>
          ))}
        </h1>
      </header>

      {hasFigures ? (
        <div className="writing-page__figures">
          {figureRows.map((row, ri) => (
            <div key={ri} className="writing-page__figure-row">
              {row.map((variant, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`writing-page__cell writing-page__cell--${variant}`}
                  role="img"
                  aria-label={figureLabels[variant]}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={`writing-page__grid${hasAside ? '' : ' writing-page__grid--single'}`}
      >
        <div className="writing-page__main">
          <div className="writing-page__body">
            <Body />
          </div>
        </div>

        {hasAside ? (
          <aside className="writing-page__aside" aria-label={t('pages.writing.asideLabel')}>
            {asideParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
