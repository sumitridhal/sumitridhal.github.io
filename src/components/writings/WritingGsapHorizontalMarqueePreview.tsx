import gsap from 'gsap'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

export type WritingGsapHorizontalMarqueePreviewProps = {
  caption?: string
  className?: string
}

/** Local copies of reference portrait ellipses (see writing note). */
const MARQUEE_PORTRAIT_SRCS = [
  '/media/writings/gsap-marquee-portraits/01.png',
  '/media/writings/gsap-marquee-portraits/02.png',
  '/media/writings/gsap-marquee-portraits/03.png',
  '/media/writings/gsap-marquee-portraits/04.png',
  '/media/writings/gsap-marquee-portraits/05.png',
  '/media/writings/gsap-marquee-portraits/06.png',
  '/media/writings/gsap-marquee-portraits/07.png',
  '/media/writings/gsap-marquee-portraits/08.png',
  '/media/writings/gsap-marquee-portraits/09.png',
  '/media/writings/gsap-marquee-portraits/10.png',
  '/media/writings/gsap-marquee-portraits/11.png',
] as const

function Avatar({ index }: { index: number }) {
  const src = MARQUEE_PORTRAIT_SRCS[index % MARQUEE_PORTRAIT_SRCS.length]
  return (
    <span className="writing-gsap-marquee-preview__avatar" aria-hidden>
      <img
        className="writing-gsap-marquee-preview__avatar-img"
        src={src}
        alt=""
        width={64}
        height={64}
        decoding="async"
        loading="lazy"
      />
    </span>
  )
}

/** Repeat a pattern so the duplicated track has enough mass for a smooth loop. */
function repeatUnits(unit: ReactNode, times: number) {
  const out: ReactNode[] = []
  for (let i = 0; i < times; i += 1) {
    out.push(
      <span key={i} className="writing-gsap-marquee-preview__unit">
        {unit}
      </span>,
    )
  }
  return <>{out}</>
}

function segmentTop() {
  const unit = (
    <>
      <span className="writing-gsap-marquee-preview__word">empathetic</span>
      <Avatar index={0} />
      <span className="writing-gsap-marquee-preview__word">useful</span>
      <Avatar index={1} />
      <span className="writing-gsap-marquee-preview__word">intuitive</span>
      <Avatar index={2} />
    </>
  )
  return repeatUnits(unit, 5)
}

function segmentMid() {
  const unit = (
    <>
      <span className="writing-gsap-marquee-preview__word">empathetic</span>
      <Avatar index={0} />
      <span className="writing-gsap-marquee-preview__rule" aria-hidden />
      <span className="writing-gsap-marquee-preview__word">useful</span>
      <Avatar index={1} />
      <span className="writing-gsap-marquee-preview__word">intuitive</span>
      <Avatar index={2} />
    </>
  )
  return repeatUnits(unit, 5)
}

function segmentBot() {
  const unit = (
    <>
      <span className="writing-gsap-marquee-preview__word">intuitive</span>
      <Avatar index={3} />
      <span className="writing-gsap-marquee-preview__word">empathetic</span>
      <Avatar index={4} />
      <span className="writing-gsap-marquee-preview__word">useful</span>
      <Avatar index={5} />
    </>
  )
  return repeatUnits(unit, 5)
}

export function WritingGsapHorizontalMarqueePreview({
  caption = 'Three overflow-clipped tracks; each inner strip is duplicated once so GSAP can loop translateX by exactly half the scroll width with linear ease.',
  className = '',
}: WritingGsapHorizontalMarqueePreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const track0 = useRef<HTMLDivElement>(null)
  const track1 = useRef<HTMLDivElement>(null)
  const track2 = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const tracks = [track0.current, track1.current, track2.current].filter(Boolean) as HTMLDivElement[]
    if (!root || tracks.length !== 3) return

    if (reduced) {
      gsap.set(tracks[0], { x: 0 })
      gsap.set(tracks[1], { x: -52 })
      gsap.set(tracks[2], { x: -28 })
      return () => {
        tracks.forEach((t) => gsap.killTweensOf(t))
      }
    }

    const ctx = gsap.context(() => {
      tracks.forEach((el, rowIndex) => {
        const half = el.scrollWidth / 2
        if (!Number.isFinite(half) || half <= 0) return

        const duration = rowIndex === 0 ? 24 : rowIndex === 1 ? 32 : 28

        if (rowIndex === 1) {
          gsap.fromTo(
            el,
            { x: -half },
            { x: 0, duration, ease: 'none', repeat: -1, immediateRender: false },
          )
        } else {
          const stretch = rowIndex === 2 ? 1.22 : 1
          gsap.fromTo(
            el,
            { x: 0 },
            { x: -half, duration: duration * stretch, ease: 'none', repeat: -1, immediateRender: false },
          )
        }
      })
    }, root)

    return () => ctx.revert()
  }, [reduced])

  const rootClass = ['writing-gsap-marquee-preview', className.trim()].filter(Boolean).join(' ')

  const segments = [segmentTop(), segmentMid(), segmentBot()]

  return (
    <figure className={rootClass}>
      {caption ? (
        <figcaption className="writing-gsap-marquee-preview__caption">{caption}</figcaption>
      ) : null}
      <div ref={rootRef} className="writing-gsap-marquee-preview__banner">
        {segments.map((segment, rowIndex) => {
          const rowKey = rowIndex === 0 ? 'top' : rowIndex === 1 ? 'mid' : 'bot'
          return (
            <div
              key={rowKey}
              className={`writing-gsap-marquee-preview__row writing-gsap-marquee-preview__row--${rowKey}`}
            >
              <div
                ref={rowIndex === 0 ? track0 : rowIndex === 1 ? track1 : track2}
                className="writing-gsap-marquee-preview__track"
              >
                <div className="writing-gsap-marquee-preview__group">{segment}</div>
                <div className="writing-gsap-marquee-preview__group" aria-hidden>
                  {segment}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
