import gsap from 'gsap'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

/**
 * Fifteen user-supplied full jacket spreads (back, spine, front). Each shelf
 * column uses object-fit cover with an optional object-position to bias the
 * crop toward the physical spine band on wide artwork.
 */
const JACKET = '/media/writings/full-jackets'

export type WritingVibeBookshelfPreviewProps = {
  /** Pass `null` to hide the figcaption. */
  caption?: ReactNode | null
  className?: string
}

type BookSpec = {
  id: string
  coverSrc: string
  alt: string
  widthRem: number
  heightRem: number
  rotate?: number
  featured?: boolean
  /** Crop bias for horizontal back–spine–front spreads (CSS `object-position`). */
  objectPosition?: string
}

const TITLE = 'Best-of jackets on a coded baseline'

const BOOKS: BookSpec[] = [
  {
    id: 'b1',
    coverSrc: `${JACKET}/01-mother-eating.png`,
    alt: 'Mother-Eating by Jess Hagemann — full jacket',
    widthRem: 1.28,
    heightRem: 9.0,
    rotate: -2.5,
  },
  {
    id: 'b2',
    coverSrc: `${JACKET}/02-the-snow-girl.png`,
    alt: 'The Snow Girl by Sophie Anderson — full jacket',
    widthRem: 1.32,
    heightRem: 9.4,
  },
  {
    id: 'b3',
    coverSrc: `${JACKET}/03-the-house-with-chicken-legs.png`,
    alt: 'The House with Chicken Legs by Sophie Anderson — full jacket',
    widthRem: 1.3,
    heightRem: 9.2,
    rotate: 2,
  },
  {
    id: 'b4',
    coverSrc: `${JACKET}/04-the-disappearances.png`,
    alt: 'The Disappearances by Emily Bain Murphy — full jacket',
    widthRem: 1.26,
    heightRem: 8.9,
  },
  {
    id: 'b5',
    coverSrc: `${JACKET}/05-a-place-called-perfect.png`,
    alt: 'A Place Called Perfect by Helena Duggan — full jacket',
    widthRem: 1.3,
    heightRem: 9.2,
  },
  {
    id: 'b6',
    coverSrc: `${JACKET}/06-a-pocket-full-of-murder.png`,
    alt: 'A Pocket Full of Murder by R.J. Anderson — full jacket',
    widthRem: 1.28,
    heightRem: 9.0,
    rotate: -2,
  },
  {
    id: 'b7',
    coverSrc: `${JACKET}/07-the-silver-chair.png`,
    alt: 'The Silver Chair (Chronicles of Narnia book 6) by C.S. Lewis — full jacket',
    widthRem: 2.65,
    heightRem: 10.8,
    featured: true,
  },
  {
    id: 'b8',
    coverSrc: `${JACKET}/08-love-as-we-know-it.png`,
    alt: 'Love as We Know It — poetry anthology — full jacket',
    widthRem: 1.28,
    heightRem: 9.1,
  },
  {
    id: 'b9',
    coverSrc: `${JACKET}/09-timeline.png`,
    alt: 'Timeline: A Visual History of Our World by Peter Goes — full jacket',
    widthRem: 1.3,
    heightRem: 9.5,
  },
  {
    id: 'b10',
    coverSrc: `${JACKET}/10-the-wind-in-the-willows.png`,
    alt: 'The Wind in the Willows by Kenneth Grahame — full jacket',
    widthRem: 1.26,
    heightRem: 8.85,
    rotate: 2.5,
  },
  {
    id: 'b11',
    coverSrc: `${JACKET}/11-to-kill-a-mockingbird.png`,
    alt: 'To Kill a Mockingbird by Harper Lee — full jacket',
    widthRem: 1.32,
    heightRem: 9.3,
  },
  {
    id: 'b12',
    coverSrc: `${JACKET}/12-east-lothian-folk-tales.png`,
    alt: 'East Lothian Folk Tales for Children by Tim Porteus — full jacket',
    widthRem: 1.28,
    heightRem: 9.0,
    rotate: -2.5,
  },
  {
    id: 'b13',
    coverSrc: `${JACKET}/13-are-you-kidding-me.png`,
    alt: 'Are You Kidding Me? by Ray Artigue — full jacket',
    widthRem: 1.3,
    heightRem: 9.2,
  },
  {
    id: 'b14',
    coverSrc: `${JACKET}/14-blood-in-shadow.png`,
    alt: 'Blood in Shadow by Laura Casey — full jacket',
    widthRem: 1.27,
    heightRem: 8.95,
  },
  {
    id: 'b15',
    coverSrc: `${JACKET}/15-lightbreakers.png`,
    alt: 'Lightbreakers by Aja Gabel — full jacket',
    widthRem: 1.3,
    heightRem: 9.1,
    rotate: 2,
  },
]

const defaultCaption = (
  <>
    Fifteen full jacket spreads (back, spine, front); each column crops toward the spine with{' '}
    <code>object-fit: cover</code> (optional per-book <code>object-position</code> when art is off-center).
  </>
)

export function WritingVibeBookshelfPreview({
  caption = defaultCaption,
  className = '',
}: WritingVibeBookshelfPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const titleLine = root.querySelector<HTMLElement>('[data-vibe-title-line]')
    const spines = root.querySelectorAll<HTMLElement>('[data-vibe-spine]')

    const hoverCleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
      if (reduced) {
        if (titleLine) gsap.set(titleLine, { opacity: 1, y: 0 })
        spines.forEach((el) => {
          const r = Number(el.dataset.rotate ?? '0')
          gsap.set(el, { opacity: 1, y: 0, scaleY: 1, rotation: r, transformOrigin: '50% 100%' })
        })
        return
      }

      if (titleLine) gsap.set(titleLine, { opacity: 0, y: 18 })
      spines.forEach((el) => {
        const r = Number(el.dataset.rotate ?? '0')
        gsap.set(el, {
          opacity: 0,
          y: 56,
          scaleY: 1,
          rotation: r * 0.35,
          transformOrigin: '50% 100%',
        })
      })

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      if (titleLine) {
        tl.to(titleLine, {
          opacity: 1,
          y: 0,
          duration: 0.58,
        })
      }
      tl.to(
        spines,
        {
          opacity: 1,
          y: 0,
          rotation: (_i, target) => Number((target as HTMLElement).dataset.rotate ?? '0'),
          duration: 0.78,
          stagger: { each: 0.032, from: 'center' },
          ease: 'power3.out',
        },
        titleLine ? '-=0.32' : 0,
      )

      spines.forEach((el) => {
        const base = Number(el.dataset.rotate ?? '0')
        const onEnter = () => {
          gsap.to(el, {
            scaleY: 1.06,
            y: -12,
            rotation: 0,
            duration: 0.26,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
        const onLeave = () => {
          gsap.to(el, {
            scaleY: 1,
            y: 0,
            rotation: base,
            duration: 0.34,
            ease: 'power2.inOut',
            overwrite: 'auto',
          })
        }
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
        hoverCleanups.push(() => {
          el.removeEventListener('mouseenter', onEnter)
          el.removeEventListener('mouseleave', onLeave)
        })
      })
    }, root)

    return () => {
      hoverCleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [reduced])

  const rootClass = ['writing-vibe-bookshelf-preview', className.trim()].filter(Boolean).join(' ')

  return (
    <figure ref={rootRef} className={rootClass} aria-label="Animated bookshelf preview">
      {caption != null ? (
        <figcaption className="writing-vibe-bookshelf-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-vibe-bookshelf-preview__frame">
        <div className="writing-vibe-bookshelf-preview__panel">
          <p className="writing-vibe-bookshelf-preview__headline">
            <span data-vibe-title-line className="writing-vibe-bookshelf-preview__headline-line">
              {TITLE}
            </span>
          </p>

          <div className="writing-vibe-bookshelf-preview__shelf" role="presentation">
            {BOOKS.map((book) => (
              <button
                key={book.id}
                type="button"
                data-vibe-spine
                data-rotate={book.rotate ?? 0}
                className={[
                  'writing-vibe-bookshelf-preview__spine',
                  book.featured ? 'writing-vibe-bookshelf-preview__spine--featured' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  width: `${book.widthRem}rem`,
                  minHeight: `${book.heightRem}rem`,
                  height: `${book.heightRem}rem`,
                }}
                aria-label={book.alt}
              >
                <img
                  className="writing-vibe-bookshelf-preview__spine-img"
                  src={book.coverSrc}
                  alt=""
                  width={120}
                  height={180}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={book.objectPosition ? { objectPosition: book.objectPosition } : undefined}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </figure>
  )
}
