import { useId, useState, type CSSProperties } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { WritingPreviewControls } from '@/components/writings/WritingPreviewControls'

const CARD_SRC = '/media/writings/payatlas-chromatic-card/card.webp'
const FOIL_SRC = '/media/writings/payatlas-chromatic-card/foil-map.png'

type AttachmentMode = 'fixed' | 'local'

type PreviewStyle = CSSProperties & {
  '--preview-h': string
  '--holographic-angle': string
  '--holographic-opacity': string
  '--holographic-attachment': AttachmentMode
}

function RangeRow({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <div className="writing-generative-play-preview__control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="writing-generative-play-preview__control-value">{display}</span>
    </div>
  )
}

export type WritingCssHolographicMaskPreviewProps = {
  caption?: string
  hint?: string
  height?: number
  className?: string
}

export function WritingCssHolographicMaskPreview({
  caption = 'Scroll inside the panel to move the card through the fixed gradient.',
  hint = 'A color-dodge gradient is clipped by the card alpha, then multiplied by a texture mask. Switch attachment modes to expose the scroll dependency.',
  height = 560,
  className = '',
}: WritingCssHolographicMaskPreviewProps) {
  const uid = useId()
  const reduced = useWritingPreviewReducedMotion()
  const [angle, setAngle] = useState(18)
  const [opacity, setOpacity] = useState(0.82)
  const [attachment, setAttachment] = useState<AttachmentMode>('fixed')
  const effectiveAttachment = reduced ? 'local' : attachment
  const style: PreviewStyle = {
    '--preview-h': `${height}px`,
    '--holographic-angle': `${angle}deg`,
    '--holographic-opacity': `${opacity}`,
    '--holographic-attachment': effectiveAttachment,
  }

  return (
    <figure className={`writing-generative-play-preview ${className}`.trim()}>
      <WritingPreviewControls
        caption={caption}
        hint={hint}
        label="CSS holographic mask controls"
      >
        <RangeRow
          id={`${uid}-angle`}
          label="Gradient angle"
          min={-90}
          max={90}
          step={1}
          value={angle}
          display={`${angle}°`}
          onChange={setAngle}
        />
        <RangeRow
          id={`${uid}-opacity`}
          label="Specular strength"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          display={opacity.toFixed(2)}
          onChange={setOpacity}
        />
        <div className="writing-generative-play-preview__control-row">
          <label htmlFor={`${uid}-attachment`}>Attachment</label>
          <select
            id={`${uid}-attachment`}
            value={attachment}
            onChange={(event) => setAttachment(event.target.value as AttachmentMode)}
            disabled={reduced}
          >
            <option value="fixed">Viewport fixed</option>
            <option value="local">Card local</option>
          </select>
          <span className="writing-generative-play-preview__control-value">
            {reduced ? 'LOCAL · REDUCED' : attachment.toUpperCase()}
          </span>
        </div>
      </WritingPreviewControls>

      <div className="writing-generative-play-preview__canvas-wrap" style={style}>
        <div
          className="writing-css-holographic-preview__scroller"
          tabIndex={0}
          aria-label="Scrollable CSS holographic card demonstration"
        >
          <div className="writing-css-holographic-preview__spacer" aria-hidden="true">
            Scroll down
          </div>
          <div className="writing-css-holographic-preview__card">
            <img
              className="writing-css-holographic-preview__base"
              src={CARD_SRC}
              alt="Purple PayAtlas spell card"
              draggable={false}
            />
            <div className="writing-css-holographic-preview__specular" aria-hidden="true">
              <img
                className="writing-css-holographic-preview__mask"
                src={FOIL_SRC}
                alt=""
                draggable={false}
              />
            </div>
          </div>
          <div
            className="writing-css-holographic-preview__spacer writing-css-holographic-preview__spacer--end"
            aria-hidden="true"
          >
            Scroll up
          </div>
        </div>
      </div>

      <footer className="writing-generative-play-preview__credit">
        CSS method after{' '}
        <a
          href="https://codepen.io/HejChristian/pen/YPzLbYX"
          target="_blank"
          rel="noreferrer"
        >
          Christian Alder
        </a>
        ; card artwork by{' '}
        <a
          href="https://artem.vyraz.studio/projects/pa/pa-4.webp"
          target="_blank"
          rel="noreferrer"
        >
          Artem Morozov
        </a>
        .
      </footer>
    </figure>
  )
}
