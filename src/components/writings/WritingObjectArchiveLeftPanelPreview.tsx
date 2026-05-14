import { useCallback, useEffect, useRef, useState } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

const BG_ETUDE =
  'https://objectandarchive.com/cdn/shop/files/Etudedeforet.jpg?v=1775498766&width=800'
const BG_RIGHT =
  'https://objectandarchive.com/cdn/shop/files/monet_detail.png?v=1777132945&width=800'
const CARD_PALE_FACE =
  'https://objectandarchive.com/cdn/shop/files/PaleFacewithRedHair.jpg?v=1775094104&width=800'
const CARD_AMPHITRITE =
  'https://objectandarchive.com/cdn/shop/files/Amphitriteetchevauxmarins.jpg?v=1773609935&width=800'

type LeftMode = 'idle' | 'zooming' | 'expanded'

export function WritingObjectArchiveLeftPanelPreview() {
  const reduced = useWritingPreviewReducedMotion()
  const [leftMode, setLeftMode] = useState<LeftMode>('idle')
  const cardRef = useRef<HTMLDivElement>(null)
  const zoomCommitRef = useRef(false)

  useEffect(() => {
    if (leftMode !== 'zooming') zoomCommitRef.current = false
  }, [leftMode])

  const isExpandedView = leftMode === 'expanded'
  const isZooming = leftMode === 'zooming'

  const activateLeft = useCallback(() => {
    if (leftMode === 'idle') {
      if (reduced) setLeftMode('expanded')
      else setLeftMode('zooming')
      return
    }
    if (leftMode === 'zooming') return
    if (leftMode === 'expanded') setLeftMode('idle')
  }, [leftMode, reduced])

  const onCardTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (leftMode !== 'zooming') return
      if (e.target !== e.currentTarget) return
      if (zoomCommitRef.current) return
      zoomCommitRef.current = true
      setLeftMode('expanded')
    },
    [leftMode],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      activateLeft()
    },
    [activateLeft],
  )

  const leftRootClass =
    'writing-oa-left-panel__left' +
    (isExpandedView ? ' writing-oa-left-panel__left--expanded' : '') +
    (isZooming ? ' writing-oa-left-panel__left--zooming' : '') +
    (reduced ? ' writing-oa-left-panel__left--reduced' : '')

  const cardClass =
    'writing-oa-left-panel__card' + (isZooming ? ' writing-oa-left-panel__card--zooming' : '')

  const cardImgSrc = isExpandedView ? CARD_AMPHITRITE : CARD_PALE_FACE
  const cardLabel = isExpandedView ? '3/17' : '2/17'

  return (
    <figure className="writing-oa-left-panel" aria-label="Left column carousel: inset expands, next work emerges">
      <figcaption className="writing-oa-left-panel__caption">
        Second beat: click the left stack. The forest backdrop and the Pale Face inset **zoom in together** while the inset
        grows to full-bleed; then the background crossfades to Pale Face and the **Amphitrite card and that plate zoom in
        together** on the same clock—mirroring the storefront carousel handoff.
      </figcaption>

      <div className="writing-oa-left-panel__stage">
        <div className="writing-oa-left-panel__split">
          <button
            type="button"
            className={leftRootClass}
            onClick={activateLeft}
            onKeyDown={onKeyDown}
            aria-expanded={isExpandedView}
            aria-label={
              isExpandedView
                ? 'Left column: expanded. Activate to reset to forest background and Pale Face inset.'
                : 'Left column: activate to expand inset and show next artwork'
            }
          >
            <span className="writing-oa-left-panel__bg writing-oa-left-panel__bg--etude" aria-hidden="true">
              <img src={BG_ETUDE} alt="" loading="lazy" decoding="async" />
            </span>
            <span className="writing-oa-left-panel__bg writing-oa-left-panel__bg--pale" aria-hidden="true">
              <img src={CARD_PALE_FACE} alt="" loading="lazy" decoding="async" />
            </span>

            <div
              ref={cardRef}
              className={cardClass}
              onTransitionEnd={reduced ? undefined : onCardTransitionEnd}
            >
              <img key={cardImgSrc} src={cardImgSrc} alt="" loading="lazy" decoding="async" />
              <span className="writing-oa-left-panel__index">{cardLabel}</span>
            </div>
          </button>

          <div className="writing-oa-left-panel__right" aria-hidden="true">
            <img src={BG_RIGHT} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <p className="writing-oa-left-panel__hint">Click the left half to play. Click again to reset.</p>
    </figure>
  )
}
