import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import {
  COSMOS_FLOAT_ITEMS,
  COSMOS_FLOAT_PLACEHOLDER_SRC,
} from '@/components/writings/cosmosFloatItems'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const DEPTH_MIN = 0.2
const DEPTH_MAX = 1
const WIDTH_MIN = 100
const WIDTH_MAX = 350
const PARALLAX_X = 48
const PARALLAX_Y = 32
const SCALE_MIN = 0.82
const SCALE_MAX = 1.38

export type WritingCosmosFloatPreviewProps = {
  caption?: string
  className?: string
}

function depthForWidth(width: number): number {
  return gsap.utils.mapRange(WIDTH_MIN, WIDTH_MAX, DEPTH_MIN, DEPTH_MAX, width)
}

function applyScrollScale(plates: HTMLDivElement[], progress: number): number {
  const scale = gsap.utils.mapRange(0, 1, SCALE_MIN, SCALE_MAX, progress)
  plates.forEach((plate) => {
    gsap.set(plate, { scale, transformOrigin: '50% 50%', force3D: true })
  })
  return scale
}

export function WritingCosmosFloatPreview({
  caption = 'Scroll inside the frame to zoom the plates in or out; move the pointer for depth parallax. Placeholder tiles until real nebula photos are wired.',
  className = '',
}: WritingCosmosFloatPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const plateRefs = useRef<(HTMLDivElement | null)[]>([])
  const driftRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollScaleRef = useRef(SCALE_MIN)

  useGSAP(
    () => {
      const viewport = viewportRef.current
      const track = trackRef.current
      const stage = stageRef.current
      const title = titleRef.current
      const plates = plateRefs.current.filter(Boolean) as HTMLDivElement[]
      const drifts = driftRefs.current.filter(Boolean) as HTMLDivElement[]
      if (
        !viewport ||
        !track ||
        !stage ||
        !title ||
        plates.length !== COSMOS_FLOAT_ITEMS.length
      ) {
        return
      }

      plates.forEach((plate) => {
        gsap.set(plate, { transformOrigin: '50% 50%', force3D: true })
      })

      if (reduced) {
        gsap.set(title, { scale: 1, opacity: 1 })
        gsap.set(plates, { x: 0, y: 0, opacity: 1, scale: 1 })
        gsap.set(drifts, { x: 0, y: 0 })
        scrollScaleRef.current = 1
        return
      }

      const quickX = plates.map((plate) =>
        gsap.quickTo(plate, 'x', { duration: 0.5, ease: 'power3.out' }),
      )
      const quickY = plates.map((plate) =>
        gsap.quickTo(plate, 'y', { duration: 0.5, ease: 'power3.out' }),
      )

      gsap.set(title, { scale: 0.8, opacity: 0 })
      gsap.set(plates, { opacity: 0, x: 0, y: 0, scale: SCALE_MIN })
      gsap.set(drifts, { x: 16, y: 24 })
      scrollScaleRef.current = SCALE_MIN

      const scrollSt = ScrollTrigger.create({
        trigger: track,
        scroller: viewport,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate(self) {
          scrollScaleRef.current = applyScrollScale(plates, self.progress)
        },
      })

      const intro = gsap.timeline({ defaults: { ease: 'power2.out' } })
      intro.to(title, { scale: 1, opacity: 1, duration: 1.1 }, 0)
      intro.to(plates, { opacity: 1, duration: 0.85, stagger: 0.04 }, 0.15)
      intro.to(drifts, { x: 0, y: 0, duration: 0.85, stagger: 0.04 }, 0.15)

      intro.call(() => {
        drifts.forEach((drift, i) => {
          const item = COSMOS_FLOAT_ITEMS[i]
          if (!item) return
          gsap.to(drift, {
            x: `+=${item.float.xAmp}`,
            y: `+=${item.float.yAmp}`,
            duration: item.float.duration,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: item.float.delay,
          })
        })
      })

      let lastT = 0
      const throttleMs = 16

      const onMove = (e: PointerEvent) => {
        const now = performance.now()
        if (now - lastT < throttleMs) return
        lastT = now

        const rect = stage.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const offsetX = (e.clientX - centerX) / (rect.width / 2)
        const offsetY = (e.clientY - centerY) / (rect.height / 2)

        COSMOS_FLOAT_ITEMS.forEach((item, i) => {
          const effectiveWidth = item.width * scrollScaleRef.current
          const depth = depthForWidth(effectiveWidth)
          quickX[i]?.(offsetX * PARALLAX_X * depth)
          quickY[i]?.(offsetY * PARALLAX_Y * depth)
        })
      }

      const onLeave = () => {
        plates.forEach((_, i) => {
          quickX[i]?.(0)
          quickY[i]?.(0)
        })
      }

      stage.addEventListener('pointermove', onMove)
      stage.addEventListener('pointerleave', onLeave)

      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh()
      })
      ro.observe(viewport)
      ro.observe(track)

      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        scrollScaleRef.current = applyScrollScale(
          plates,
          scrollSt.progress ?? 0,
        )
      })

      return () => {
        stage.removeEventListener('pointermove', onMove)
        stage.removeEventListener('pointerleave', onLeave)
        ro.disconnect()
        scrollSt.kill()
      }
    },
    { scope: viewportRef, dependencies: [reduced], revertOnUpdate: true },
  )

  const rootClass = ['writing-cosmos-float', className.trim()].filter(Boolean).join(' ')

  return (
    <figure className={rootClass}>
      {caption ? (
        <figcaption className="writing-cosmos-float__caption">{caption}</figcaption>
      ) : null}
      <div
        ref={viewportRef}
        className="writing-cosmos-float__viewport"
        data-lenis-prevent
        tabIndex={0}
      >
        <div ref={trackRef} className="writing-cosmos-float__track">
          <div ref={stageRef} className="writing-cosmos-float__stage">
            {COSMOS_FLOAT_ITEMS.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  plateRefs.current[index] = el
                }}
                className="writing-cosmos-float__plate"
                style={{
                  left: `${item.left}%`,
                  top: `${item.top}%`,
                  zIndex: item.zIndex,
                  width: item.width,
                }}
              >
                <div
                  ref={(el) => {
                    driftRefs.current[index] = el
                  }}
                  className="writing-cosmos-float__drift"
                >
                  <img
                    className="writing-cosmos-float__img"
                    src={COSMOS_FLOAT_PLACEHOLDER_SRC}
                    alt={item.alt}
                    width={item.width}
                    height={Math.round(item.width * 0.75)}
                    loading="lazy"
                    decoding="async"
                    style={{ filter: `hue-rotate(${item.hueRotate}deg)` }}
                  />
                </div>
              </div>
            ))}
            <h2 ref={titleRef} className="writing-cosmos-float__title">
              <span className="writing-cosmos-float__title-line">Explore</span>
              <span className="writing-cosmos-float__title-line">The Cosmos</span>
            </h2>
          </div>
        </div>
      </div>
    </figure>
  )
}
