import { useRef, type CSSProperties, type ReactNode } from 'react'

import { ExperimentMedia } from '@/components/experiments/ExperimentMedia'
import type { HomeExperiment } from '@/data/experimentsData'
import {
  collageHeight,
  slotForIndex,
  type CollageSlot,
} from '@/data/experimentsCollage'
import { useCollageParallax } from '@/hooks/useCollageParallax'

type CollageStyle = CSSProperties & {
  '--collage-height': string
  '--x': string
  '--y': string
  '--w': string
  '--ar': number
  '--depth': number
}

type ExperimentCollageProps = {
  items: HomeExperiment[]
  slots: CollageSlot[]
  overlay?: ReactNode
  className?: string
  ariaLabel?: string
}

export function ExperimentCollage({
  items,
  slots,
  overlay,
  className = '',
  ariaLabel,
}: ExperimentCollageProps) {
  const collageRef = useRef<HTMLDivElement>(null)
  useCollageParallax(collageRef)

  const rootClassName = ['collage', className].filter(Boolean).join(' ')
  const height = `${collageHeight(items.length, slots)}rem`

  return (
    <div
      ref={collageRef}
      className={rootClassName}
      style={{ '--collage-height': height } as CSSProperties}
    >
      {overlay ? <div className="collage__overlay">{overlay}</div> : null}
      <ul className="collage__list" role="list" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const slot = slotForIndex(index, slots)
          const style: CollageStyle = {
            '--collage-height': height,
            '--x': `${slot.x}%`,
            '--y': `${slot.y}rem`,
            '--w': `${slot.w}%`,
            '--ar': slot.ar,
            '--depth': slot.depth,
          }

          return (
            <li
              key={item.id}
              className="collage__cell"
              data-collage-tile
              data-home-reveal
              style={style}
            >
              <div className="collage__float" data-collage-float data-depth={slot.depth}>
                <div className="collage__pointer" data-collage-pointer>
                  <div className="collage__frame">
                    <ExperimentMedia
                      item={item}
                      className="collage__media"
                      playback={slot.depth >= 0.72 ? 'auto' : 'hover'}
                    />
                  </div>
                  <div className="collage__caption">
                    <span className="collage__title">{item.title}</span>
                    {item.tag ? <span className="collage__cat">{item.tag}</span> : null}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
