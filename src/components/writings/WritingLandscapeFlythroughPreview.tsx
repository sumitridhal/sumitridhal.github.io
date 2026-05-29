import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'locomotive-scroll/locomotive-scroll.css'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { WritingLandscapeFlythroughSvg } from '@/components/writings/landscape/WritingLandscapeFlythroughSvg'
import { useWritingPreviewReducedMotion } from '@/components/writings/useWritingPreviewReducedMotion'
import { useLocomotiveScrollTriggerEmbed } from '@/hooks/useLocomotiveScrollTriggerEmbed'
import { useLenis } from '@/providers/LenisProvider'

gsap.registerPlugin(ScrollTrigger)

const LAYER_IDS = [
  'layer-sky',
  'layer-mountains',
  'layer-trees',
  'layer-ground',
  'layer-foreground',
] as const

const LAYER_TRANSFORM_ORIGIN = '50% 65%'

const FLYTHROUGH_END = {
  'layer-sky': { scale: 1.1, yPercent: 2 },
  'layer-mountains': { scale: 1.5, yPercent: 8 },
  'layer-trees': { scale: 4, yPercent: 18 },
  'layer-ground': { scale: 4, yPercent: 22 },
  'layer-foreground': { scale: 7.5, yPercent: 30 },
} as const

const REDUCED_MOTION_END = {
  'layer-sky': { scale: 1.06, yPercent: 1 },
  'layer-mountains': { scale: 1.28, yPercent: 5 },
  'layer-trees': { scale: 2.2, yPercent: 10 },
  'layer-ground': { scale: 2.2, yPercent: 12 },
  'layer-foreground': { scale: 3.2, yPercent: 16 },
} as const

export type WritingLandscapeFlythroughPreviewProps = {
  caption?: string
  className?: string
}

function queryLayers(svg: SVGSVGElement | null): (SVGElement | null)[] {
  if (!svg) return []
  return LAYER_IDS.map((id) => svg.querySelector<SVGElement>(`#${id}`))
}

function IconExpand() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4M16 4h4v4M16 20h4v-4M8 20H4v-4" />
    </svg>
  )
}

function IconCollapse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6M14 4h6v6M14 20h6v-6M4 10h6V4" />
    </svg>
  )
}

export function WritingLandscapeFlythroughPreview({
  caption = 'Scroll inside the stage: Locomotive smooths the shell; ScrollTrigger scrubs differential layer scale for a 2.5D fly-through.',
  className = '',
}: WritingLandscapeFlythroughPreviewProps) {
  const reduced = useWritingPreviewReducedMotion()
  const pageLenis = useLenis()
  const [isExpanded, setIsExpanded] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const expandBtnRef = useRef<HTMLButtonElement>(null)

  const closeExpanded = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const openExpanded = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const handleExpandControlClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (isExpanded) {
        closeExpanded()
      } else {
        openExpanded()
      }
    },
    [isExpanded, closeExpanded, openExpanded],
  )

  useEffect(() => {
    if (!isExpanded) return

    pageLenis?.stop()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeExpanded()
    }
    window.addEventListener('keydown', onKeyDown)

    requestAnimationFrame(() => {
      shellRef.current?.focus()
      ScrollTrigger.refresh()
    })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      pageLenis?.start()
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        expandBtnRef.current?.focus()
      })
    }
  }, [isExpanded, pageLenis, closeExpanded])

  const scrollReady = useLocomotiveScrollTriggerEmbed({
    shellRef,
    trackRef,
    reducedMotion: reduced,
    smoothClassName: 'writing-landscape-flythrough__shell--smooth',
    pageLenis,
  })

  useEffect(() => {
    if (!scrollReady) return
    const id = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return () => window.cancelAnimationFrame(id)
  }, [isExpanded, scrollReady])

  useLayoutEffect(() => {
    if (!scrollReady) return

    const shell = shellRef.current
    const track = trackRef.current
    const svg = svgRef.current
    if (!shell || !track) return

    const layers = queryLayers(svg)
    if (layers.some((el) => !el)) return

    const endState = reduced ? REDUCED_MOTION_END : FLYTHROUGH_END
    const scrollDistance = () =>
      Math.max(1, track.scrollHeight - shell.clientHeight)

    const ctx = gsap.context(() => {
      layers.forEach((el) => {
        if (el) gsap.set(el, { transformOrigin: LAYER_TRANSFORM_ORIGIN, force3D: true, scale: 1, yPercent: 0 })
      })

      if (reduced) {
        layers.forEach((el, i) => {
          const id = LAYER_IDS[i]
          if (el) gsap.set(el, endState[id])
        })

        ScrollTrigger.create({
          trigger: track,
          scroller: shell,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          scrub: 0,
          invalidateOnRefresh: true,
        })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          scroller: shell,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      LAYER_IDS.forEach((id, i) => {
        const el = layers[i]
        if (!el) return
        tl.to(el, { ...endState[id], ease: 'none' }, 0)
      })
    }, shell)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      ctx.revert()
    }
  }, [scrollReady, reduced, isExpanded])

  const rootClass = ['writing-landscape-flythrough', className.trim()].filter(Boolean).join(' ')

  return (
    <figure className={rootClass} aria-label="SVG landscape fly-through parallax scroll demo">
      {caption ? <figcaption className="writing-landscape-flythrough__caption">{caption}</figcaption> : null}

      <div
        className="writing-landscape-flythrough__embed"
        data-lenis-prevent
        data-expanded={isExpanded ? 'true' : 'false'}
      >
        {isExpanded ? (
          <button
            type="button"
            className="writing-landscape-flythrough__backdrop"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              closeExpanded()
            }}
            aria-label="Exit full-screen preview"
          />
        ) : null}
        <button
          ref={expandBtnRef}
          type="button"
          className="writing-landscape-flythrough__expand"
          onClick={handleExpandControlClick}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Exit full-screen preview' : 'Open full-screen preview'}
        >
          {isExpanded ? <IconCollapse /> : <IconExpand />}
        </button>
        <div
          id="smooth-wrapper"
          ref={shellRef}
          className="writing-landscape-flythrough__shell"
          tabIndex={0}
        >
          <div id="smooth-content" ref={trackRef} className="writing-landscape-flythrough__track">
            <div className="writing-landscape-flythrough__camera" aria-hidden="true">
              <WritingLandscapeFlythroughSvg
                svgRef={svgRef}
                className="writing-landscape-flythrough__svg"
              />
            </div>
            <div className="writing-landscape-flythrough__spacer" aria-hidden="true" />
          </div>
        </div>
      </div>
    </figure>
  )
}
