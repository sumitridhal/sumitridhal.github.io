import { useLayoutEffect, useRef } from 'react'

import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

/** ViewBox matches path authoring space. */
const VB_W = 960
const VB_H = 360

/**
 * Continuous path: flat lead-in, vertical loop, flat lead-out.
 * Tuned so arc-length sampling reads as a single ride (not separate segments).
 */
const TRACK_PATH =
  'M 48 232 L 268 232 C 352 232 376 88 468 72 C 560 56 628 144 606 232 C 584 320 508 376 432 356 C 356 336 320 232 396 232 L 912 232'

const TILE_COUNT = 22
const TANGENT_EPS = 5
const LOOP_U0 = 0.34
const LOOP_U1 = 0.7
const LOOP_Y_SPLIT = 198

export type WritingMotionPathTilesPreviewProps = {
  caption?: string
  className?: string
}

type TileSpec = {
  alt: string
  src: string
}

/** Square typographic tiles; repeated along the path for density. */
const TILES: TileSpec[] = [
  {
    alt: 'Stylized 3D letter B on a deep blue field',
    src: '/media/writings/motion-path-typography-tiles/01.png',
  },
  {
    alt: 'Geometric isometric number 5 on green',
    src: '/media/writings/motion-path-typography-tiles/02.png',
  },
  {
    alt: 'Stylized 3D letter F on orange',
    src: '/media/writings/motion-path-typography-tiles/03.png',
  },
  {
    alt: 'Script letter D with striped extrusion on orange-red',
    src: '/media/writings/motion-path-typography-tiles/04.png',
  },
  {
    alt: 'Stylized 3D letter A on navy',
    src: '/media/writings/motion-path-typography-tiles/05.png',
  },
  {
    alt: 'Striped slab-serif letter M on orange',
    src: '/media/writings/motion-path-typography-tiles/06.png',
  },
  {
    alt: 'Letter R on pink and lightning-bolt red and blue',
    src: '/media/writings/motion-path-typography-tiles/07.png',
  },
  {
    alt: 'Mehrspur poster with mouth graphic and border type',
    src: '/media/writings/motion-path-typography-tiles/08.png',
  },
  {
    alt: 'Flat illustration of a hand holding a small creature',
    src: '/media/writings/motion-path-typography-tiles/09.png',
  },
  {
    alt: 'Tattoo-style panther head on a pale blue field',
    src: '/media/writings/motion-path-typography-tiles/10.png',
  },
]

function zForTile(u: number, y: number, index: number): number {
  const inLoop = u >= LOOP_U0 && u <= LOOP_U1
  const backStrand = inLoop && y > LOOP_Y_SPLIT
  const depth = Math.round(y * 2.2)
  const order = index * 3
  return 200 + depth + order + (backStrand ? -140 : 0)
}

export function WritingMotionPathTilesPreview({
  caption = 'Hand-sampled SVG path: equal arc-length spacing, finite-difference tangent, z-index heuristic on the loop’s rear strand.',
  className = '',
}: WritingMotionPathTilesPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const pathRef = useRef<SVGPathElement | null>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const phaseRef = useRef(0)

  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return

    const tiles = tileRefs.current
    const len = path.getTotalLength()
    if (!Number.isFinite(len) || len <= 0) return

    const update = () => {
      const phase = phaseRef.current
      for (let i = 0; i < TILE_COUNT; i++) {
        const el = tiles[i]
        if (!el) continue
        const u = (i / TILE_COUNT + phase * 0.35) % 1
        const s = u * len
        const p = path.getPointAtLength(s)
        const p2 = path.getPointAtLength(Math.min(s + TANGENT_EPS, len - 0.001))
        const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI
        const zi = zForTile(u, p.y, i)
        el.style.left = `${(p.x / VB_W) * 100}%`
        el.style.top = `${(p.y / VB_H) * 100}%`
        el.style.transform = `translate(-50%, -50%) rotate(${ang}deg)`
        el.style.zIndex = String(zi)
      }
    }

    update()

    if (reduced) {
      return () => {
        cancelAnimationFrame(rafRef.current)
      }
    }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      phaseRef.current = (phaseRef.current + dt * 0.09) % 1
      update()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  const rootClass = [
    'writing-motion-path-tiles-preview',
    className.trim(),
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <figure className={rootClass}>
      {caption ? (
        <figcaption className="writing-motion-path-tiles-preview__caption">{caption}</figcaption>
      ) : null}
      <div className="writing-motion-path-tiles-preview__stage">
        <svg
          className="writing-motion-path-tiles-preview__svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            ref={pathRef}
            d={TRACK_PATH}
            className="writing-motion-path-tiles-preview__path"
            fill="none"
          />
        </svg>
        <div className="writing-motion-path-tiles-preview__tiles">
          {Array.from({ length: TILE_COUNT }, (_, i) => {
            const t = TILES[i % TILES.length]
            return (
              <div
                key={i}
                ref={(el) => {
                  tileRefs.current[i] = el
                }}
                className="writing-motion-path-tiles-preview__tile writing-motion-path-tiles-preview__tile--thumb"
              >
                <img
                  className="writing-motion-path-tiles-preview__thumb"
                  src={t.src}
                  alt={t.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )
          })}
        </div>
      </div>
    </figure>
  )
}
