import { useCallback, useId, useState } from 'react'

const COLS_HALF = 3
const ROWS = 5
const COLS_FULL = 5

function randomHalfGrid(): boolean[][] {
  return Array.from({ length: COLS_HALF }, () =>
    Array.from({ length: ROWS }, () => Math.random() > 0.48),
  )
}

function fullCell(half: boolean[][], x: number, y: number): boolean {
  const c = x <= 2 ? x : COLS_FULL - 1 - x
  return half[c]![y]!
}

export type WritingInvaderFractalPreviewProps = {
  caption?: string
  className?: string
}

export function WritingInvaderFractalPreview({
  caption = 'Jared Tarbell’s recipe: fill a 3×5 half grid, mirror columns around the centre to read a 5×5 invader. Random rolls a new half grid.',
  className = '',
}: WritingInvaderFractalPreviewProps) {
  const uid = useId()
  const [half, setHalf] = useState(() => randomHalfGrid())

  const reroll = useCallback(() => {
    setHalf(randomHalfGrid())
  }, [])

  return (
    <figure className={`writing-invader-fractal-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-invader-fractal-preview__caption">{caption}</figcaption> : null}
      <div className="writing-invader-fractal-preview__toolbar">
        <button type="button" className="writing-invader-fractal-preview__random" onClick={reroll}>
          Random invader
        </button>
      </div>
      <div className="writing-invader-fractal-preview__body">
        <div className="writing-invader-fractal-preview__half" aria-hidden="true">
          <p className="writing-invader-fractal-preview__label">Half (3×5)</p>
          <div
            className="writing-invader-fractal-preview__mini"
            style={{ gridTemplateColumns: `repeat(${COLS_HALF}, 1fr)` }}
          >
            {Array.from({ length: COLS_HALF * ROWS }, (_, i) => {
              const x = i % COLS_HALF
              const y = Math.floor(i / COLS_HALF)
              const on = half[x]![y]!
              return <span key={`h-${x}-${y}`} className={on ? 'is-on' : 'is-off'} />
            })}
          </div>
        </div>
        <div className="writing-invader-fractal-preview__arrow" aria-hidden="true">
          →
        </div>
        <div className="writing-invader-fractal-preview__full">
          <p className="writing-invader-fractal-preview__label">Mirrored 5×5</p>
          <div
            className="writing-invader-fractal-preview__grid"
            style={{ gridTemplateColumns: `repeat(${COLS_FULL}, 1fr)` }}
            role="img"
            aria-label="Five by five symmetric invader pixel grid"
            id={`${uid}-grid`}
          >
            {Array.from({ length: COLS_FULL * ROWS }, (_, i) => {
              const x = i % COLS_FULL
              const y = Math.floor(i / COLS_FULL)
              const on = fullCell(half, x, y)
              return <span key={`f-${x}-${y}`} className={on ? 'is-on' : 'is-off'} />
            })}
          </div>
        </div>
      </div>
    </figure>
  )
}
