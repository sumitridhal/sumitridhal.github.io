import type { ReactNode } from 'react'

import { useI18n } from '@/contexts/I18nContext'
import type { WritingPreviewStep } from '@/data/writingTypes'

export type WritingPreviewPaneProps = {
  /** The post's pinned demo, from the MDX `preview` export. */
  preview?: ReactNode
  /** Still art used when a post has no interactive demo. */
  coverSrc?: string
  notes: string[]
  steps?: WritingPreviewStep[]
  activeId?: string
  onSelectStep?: (id: string) => void
}

/**
 * Right-hand pane of the article split view: the post's demo (or its cover art)
 * plus the technical notes that used to live in the narrow aside column.
 */
export function WritingPreviewPane({
  preview,
  coverSrc,
  notes,
  steps,
  activeId,
  onSelectStep,
}: WritingPreviewPaneProps) {
  const { t } = useI18n()
  const activeStep = steps?.find((step) => step.id === activeId) ?? steps?.[0]

  const visual =
    activeStep?.node ??
    preview ??
    (coverSrc ? (
      <figure className="writing-inline-figure">
        <img src={coverSrc} alt="" loading="lazy" decoding="async" />
      </figure>
    ) : null)

  return (
    <section className="writing-page__preview" aria-label={t('pages.writing.previewLabel')}>
      {steps && steps.length > 0 && activeStep ? (
        <nav className="writing-page__preview-steps" aria-label="Article preview steps">
          <p className="writing-page__preview-step-status" aria-live="polite">
            {steps.indexOf(activeStep) + 1} / {steps.length} · {activeStep.label}
          </p>
          <div className="writing-page__preview-step-buttons">
            {steps.map((step, index) => {
              const isActive = step.id === activeStep.id
              return (
                <button
                  key={step.id}
                  type="button"
                  className={isActive ? 'is-active' : ''}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${index + 1} of ${steps.length}: ${step.label}`}
                  title={step.label}
                  onClick={() => onSelectStep?.(step.id)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </nav>
      ) : null}

      {/*
        `writing-page__body` is carried deliberately: every preview embed is styled
        as a descendant of it, so the pane needs it for those rules to apply.
      */}
      {visual ? (
        <div
          key={activeStep?.id ?? 'preview'}
          className="writing-page__preview-surface writing-page__body"
        >
          {visual}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <aside className="writing-page__aside" aria-label={t('pages.writing.asideLabel')}>
          {notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </aside>
      ) : null}
    </section>
  )
}
