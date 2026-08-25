import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { WritingPreviewPane } from '@/components/writings/WritingPreviewPane'
import { WritingPreviewStepsProvider } from '@/components/writings/WritingPreviewCue'
import { useI18n } from '@/contexts/I18nContext'
import {
  asideParagraphsForWriting,
  getWritingEntryBySlug,
  writingHeadline,
  type WritingFigureVariant,
} from '@/data/writingsData'
import { hrefWritings } from '@/i18n/routes'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useActivePreviewStep } from '@/hooks/useActivePreviewStep'
import { useSplitPane } from '@/hooks/useSplitPane'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'
import { formatWritingDate } from '@/utils/formatWritingDate'

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
  const { t } = useI18n()
  const navigate = useViewTransitionNavigate()

  const entry = useMemo(() => getWritingEntryBySlug(slug), [slug])
  const writing = entry?.meta
  const Body = entry?.Body
  const headline = useMemo(() => (writing ? writingHeadline(writing) : ''), [writing])
  const asideParagraphs = useMemo(
    () => (writing ? asideParagraphsForWriting(writing) : []),
    [writing],
  )
  const figureRows = writing?.figureRows ?? []
  const previewSteps = useMemo(() => entry?.previewSteps ?? [], [entry])

  const isStacked = useMediaQuery('(max-width: 900px)')
  const { activeId, registerCue, scrollToCue } = useActivePreviewStep(previewSteps)
  const { containerRef, dragging, percent, minPercent, maxPercent, separatorProps } =
    useSplitPane({ disabled: isStacked })

  if (!slug || !writing || !Body) {
    return <Navigate to={hrefWritings} replace />
  }

  const hasFigures = figureRows.length > 0

  return (
    <article className="writing-page">
      <div className="writing-page__toolbar">
        <button
          type="button"
          className="writing-page__back"
          onClick={() => navigate(hrefWritings)}
        >
          {t('pages.writing.back')}
        </button>
        <p className="writing-page__meta">
          <span className="writing-page__date">{formatWritingDate(writing.date)}</span>
          <span className="writing-page__tag">{writing.category}</span>
        </p>
      </div>

      <header className="writing-page__hero">
        <h1 className="writing-page__headline">{headline}</h1>
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
        ref={containerRef}
        className={`writing-page__split${dragging ? ' is-dragging' : ''}`}
      >
        <div className="writing-page__main">
          <div className="writing-page__body">
            <WritingPreviewStepsProvider
              steps={previewSteps}
              isStacked={isStacked}
              registerCue={registerCue}
            >
              <Body />
            </WritingPreviewStepsProvider>
          </div>
        </div>

        <div
          className="writing-page__resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label={t('pages.writing.resizerLabel')}
          aria-valuenow={percent}
          aria-valuemin={minPercent}
          aria-valuemax={maxPercent}
          tabIndex={isStacked ? -1 : 0}
          {...separatorProps}
        />

        <WritingPreviewPane
          preview={previewSteps.length > 0 ? undefined : entry?.preview}
          coverSrc={previewSteps.length > 0 ? undefined : writing.coverSrc}
          notes={asideParagraphs}
          steps={isStacked ? undefined : previewSteps}
          activeId={activeId}
          onSelectStep={scrollToCue}
        />
      </div>
    </article>
  )
}
