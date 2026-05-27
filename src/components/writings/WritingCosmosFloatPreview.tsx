import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import {
  COSMOS_FLOAT_ITEMS,
  COSMOS_FLOAT_PLACEHOLDER_SRC,
  COSMOS_RENDER_ORDER,
  COSMOS_SPAWN_ITEMS,
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
/** Scale stops growing past the zoom phase; fade takes over. */
const SCALE_PEAK = 1.24
/** Scroll progress (0–1) where main plates reach peak scale. */
const ZOOM_PHASE_END = 0.48
const SPAWN_SCALE_MAX = 0.88

export type WritingCosmosFloatPreviewProps = {
  caption?: string
  className?: string
}

function depthForWidth(width: number): number {
  return gsap.utils.mapRange(WIDTH_MIN, WIDTH_MAX, DEPTH_MIN, DEPTH_MAX, width)
}

function plateTransform(
  plate: HTMLDivElement,
  scale: number,
  opacity: number,
): void {
  gsap.set(plate, {
    scale,
    opacity,
    transformOrigin: '50% 50%',
    force3D: true,
  })
}

function fadeStartForIndex(index: number): number {
  return ZOOM_PHASE_END + (index % 7) * 0.028
}

function fadeEndForIndex(index: number): number {
  return Math.min(fadeStartForIndex(index) + 0.32, 0.98)
}

function applyMainPlatesScroll(
  plates: HTMLDivElement[],
  progress: number,
): number {
  let refScale = SCALE_MIN

  plates.forEach((plate, i) => {
    const fadeStart = fadeStartForIndex(i)
    const fadeEnd = fadeEndForIndex(i)

    if (progress <= ZOOM_PHASE_END) {
      const scale = gsap.utils.mapRange(0, ZOOM_PHASE_END, SCALE_MIN, SCALE_PEAK, progress)
      plateTransform(plate, scale, 1)
      refScale = scale
      return
    }

    if (progress < fadeStart) {
      plateTransform(plate, SCALE_PEAK, 1)
      refScale = SCALE_PEAK
      return
    }

    const opacity = gsap.utils.mapRange(fadeStart, fadeEnd, 1, 0, progress)
    const clamped = gsap.utils.clamp(0, 1, opacity)
    plateTransform(plate, SCALE_PEAK, clamped)
    if (clamped > 0.05) refScale = SCALE_PEAK * clamped
  })

  return refScale
}

function applySpawnPlatesScroll(
  plates: HTMLDivElement[],
  progress: number,
): void {
  plates.forEach((plate, i) => {
    const item = COSMOS_SPAWN_ITEMS[i]
    if (!item) return

    if (progress < item.spawnAt) {
      plateTransform(plate, 0.5, 0)
      return
    }

    const local = (progress - item.spawnAt) / (1 - item.spawnAt)
    const appear = gsap.utils.clamp(0, 1, local * 2.8)
    const scale = gsap.utils.mapRange(0, 1, 0.45, SPAWN_SCALE_MAX, appear)
    plateTransform(plate, scale, appear)
  })
}

export function WritingCosmosFloatPreview({
  caption = 'Scroll to zoom the main plates, then they fade; small specks appear throughout the scroll, woven between the larger tiles. Pointer move adds parallax.',
  className = '',
}: WritingCosmosFloatPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const plateRefs = useRef<(HTMLDivElement | null)[]>([])
  const driftRefs = useRef<(HTMLDivElement | null)[]>([])
  const spawnPlateRefs = useRef<(HTMLDivElement | null)[]>([])
  const spawnDriftRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollScaleRef = useRef(SCALE_MIN)
  const spawnFloatStartedRef = useRef<Set<string>>(new Set())

  useGSAP(
    () => {
      const viewport = viewportRef.current
      const track = trackRef.current
      const stage = stageRef.current
      const title = titleRef.current
      const plates = plateRefs.current.filter(Boolean) as HTMLDivElement[]
      const drifts = driftRefs.current.filter(Boolean) as HTMLDivElement[]
      const spawnPlates = spawnPlateRefs.current.filter(Boolean) as HTMLDivElement[]
      const spawnDrifts = spawnDriftRefs.current.filter(Boolean) as HTMLDivElement[]
      if (
        !viewport ||
        !track ||
        !stage ||
        !title ||
        plates.length !== COSMOS_FLOAT_ITEMS.length ||
        spawnPlates.length !== COSMOS_SPAWN_ITEMS.length
      ) {
        return
      }

      const allParallaxPlates = [...plates, ...spawnPlates]
      const allItems = [
        ...COSMOS_FLOAT_ITEMS.map((item) => ({ width: item.width })),
        ...COSMOS_SPAWN_ITEMS.map((item) => ({ width: item.width })),
      ]

      plates.forEach((plate) => {
        gsap.set(plate, { transformOrigin: '50% 50%', force3D: true })
      })
      spawnPlates.forEach((plate) => {
        gsap.set(plate, { transformOrigin: '50% 50%', force3D: true, opacity: 0, scale: 0.5 })
      })

      const startSpawnFloat = (index: number) => {
        const item = COSMOS_SPAWN_ITEMS[index]
        const drift = spawnDrifts[index]
        if (!item || !drift || spawnFloatStartedRef.current.has(item.id)) return
        spawnFloatStartedRef.current.add(item.id)
        gsap.to(drift, {
          x: `+=${item.float.xAmp}`,
          y: `+=${item.float.yAmp}`,
          duration: item.float.duration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: item.float.delay,
        })
      }

      const updateScrollVisuals = (progress: number) => {
        scrollScaleRef.current = applyMainPlatesScroll(plates, progress)
        applySpawnPlatesScroll(spawnPlates, progress)
        if (!reduced) {
          COSMOS_SPAWN_ITEMS.forEach((item, i) => {
            if (progress >= item.spawnAt + 0.04) startSpawnFloat(i)
          })
        }
      }

      if (reduced) {
        gsap.set(title, { scale: 1, opacity: 1 })
        gsap.set(plates, { x: 0, y: 0, opacity: 1, scale: 1 })
        gsap.set(drifts, { x: 0, y: 0 })
        gsap.set(spawnPlates, { x: 0, y: 0, opacity: 0.85, scale: 0.75 })
        gsap.set(spawnDrifts, { x: 0, y: 0 })
        scrollScaleRef.current = 1
        return
      }

      spawnFloatStartedRef.current.clear()

      const quickX = allParallaxPlates.map((plate) =>
        gsap.quickTo(plate, 'x', { duration: 0.5, ease: 'power3.out' }),
      )
      const quickY = allParallaxPlates.map((plate) =>
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
          updateScrollVisuals(self.progress)
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

        allParallaxPlates.forEach((plate, i) => {
          const opacity = Number(gsap.getProperty(plate, 'opacity')) || 0
          if (opacity < 0.08) return

          const item = allItems[i]
          if (!item) return
          const scale = Number(gsap.getProperty(plate, 'scale')) || 1
          const effectiveWidth = item.width * scale
          const depth = depthForWidth(
            i < COSMOS_FLOAT_ITEMS.length
              ? effectiveWidth
              : gsap.utils.mapRange(40, 80, DEPTH_MIN, 0.45, item.width),
          )
          quickX[i]?.(offsetX * PARALLAX_X * depth)
          quickY[i]?.(offsetY * PARALLAX_Y * depth)
        })
      }

      const onLeave = () => {
        allParallaxPlates.forEach((_, i) => {
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
        updateScrollVisuals(scrollSt.progress ?? 0)
      })

      return () => {
        stage.removeEventListener('pointermove', onMove)
        stage.removeEventListener('pointerleave', onLeave)
        ro.disconnect()
        scrollSt.kill()
        spawnFloatStartedRef.current.clear()
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
            {COSMOS_RENDER_ORDER.map((entry) => {
              if (entry.type === 'main') {
                const item = COSMOS_FLOAT_ITEMS[entry.index]
                if (!item) return null
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      plateRefs.current[entry.index] = el
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
                        driftRefs.current[entry.index] = el
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
                )
              }

              const item = COSMOS_SPAWN_ITEMS[entry.index]
              if (!item) return null
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    spawnPlateRefs.current[entry.index] = el
                  }}
                  className="writing-cosmos-float__plate writing-cosmos-float__plate--spawn"
                  style={{
                    left: `${item.left}%`,
                    top: `${item.top}%`,
                    zIndex: item.zIndex,
                    width: item.width,
                  }}
                >
                  <div
                    ref={(el) => {
                      spawnDriftRefs.current[entry.index] = el
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
              )
            })}
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
