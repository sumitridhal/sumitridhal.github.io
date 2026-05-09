import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

import { useAppState } from '@/contexts/AppStateContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useI18n } from '@/contexts/I18nContext'

const SUB_LINE = 'Portfolio'

const EASE_MAIN = 'power3.inOut'
const CHAR_STAGGER = 0.04
const REST_INNER_Y = -1

function CharCells({ text, idPrefix }: { text: string; idPrefix: string }) {
  return [...text].map((ch, i) => (
    <span
      key={`${idPrefix}-${i}`}
      className={`intro__char${ch === ' ' ? ' intro__char--space' : ''}`}
    >
      <span className="intro__char-inner">{ch === ' ' ? '\u00a0' : ch}</span>
    </span>
  ))
}

function prepareCharMetrics(charEls: HTMLElement[]) {
  charEls.forEach((cell) => {
    const inner = cell.querySelector<HTMLElement>('.intro__char-inner')
    if (!inner) return

    cell.style.overflow = 'visible'
    cell.style.maxHeight = 'none'
    const h = Math.max(1, Math.ceil(inner.getBoundingClientRect().height))
    cell.style.overflow = ''
    cell.style.maxHeight = ''

    cell.dataset.introCharHeight = String(h)
    const hoverHeight = Math.max(Math.ceil(h * 1.72), h + 14)
    cell.dataset.introHoverHeight = String(hoverHeight)
  })
}

/** Vertical analogue of HeroAtmosphere playRowExpand: maxHeight (+ clip) + inner translateY stagger. */
function introLineExpandTl(chars: HTMLElement[], inners: HTMLElement[]) {
  gsap.killTweensOf([chars, inners])

  chars.forEach((cell) => {
    const inner = cell.querySelector<HTMLElement>('.intro__char-inner')
    if (!inner) return
    const reveal = Number.parseFloat(
      cell.dataset.introHoverHeight ?? cell.dataset.introCharHeight ?? '28',
    )
    gsap.set(cell, { maxHeight: 3 })
    gsap.set(inner, { y: reveal })
  })

  const tl = gsap.timeline()
  tl.to(
    chars,
    {
      maxHeight: (_i: number, target: HTMLElement) =>
        Number.parseFloat(target.dataset.introHoverHeight ?? target.dataset.introCharHeight ?? '32'),
      duration: 0.64,
      stagger: CHAR_STAGGER,
      ease: EASE_MAIN,
    },
    0,
  )
  tl.to(
    inners,
    {
      y: REST_INNER_Y,
      duration: 0.64,
      stagger: CHAR_STAGGER,
      ease: EASE_MAIN,
    },
    0.05,
  )
  return tl
}

export function Intro() {
  const { t } = useI18n()

  const { introComplete, setIntroComplete } = useAppState()
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLParagraphElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    if (introComplete) return

    if (reduced) {
      setIntroComplete(true)
      return
    }

    const root = rootRef.current
    const brandLine = brandRef.current
    const subLine = subRef.current
    if (!root || !brandLine || !subLine) return

    let cancelled = false

    const run = async () => {
      await document.fonts.ready.catch(() => undefined)
      if (cancelled || !brandLine.isConnected || !subLine.isConnected || !root.isConnected) return

      const brandChars = Array.from(brandLine.querySelectorAll<HTMLElement>('.intro__char'))
      const brandInners = Array.from(brandLine.querySelectorAll<HTMLElement>('.intro__char-inner'))
      const subChars = Array.from(subLine.querySelectorAll<HTMLElement>('.intro__char'))
      const subInners = Array.from(subLine.querySelectorAll<HTMLElement>('.intro__char-inner'))

      prepareCharMetrics([...brandChars, ...subChars])

      gsap.set(root, { opacity: 1 })

      const master = gsap.timeline({
        onComplete: () => {
          if (!cancelled) setIntroComplete(true)
        },
      })
      timelineRef.current = master

      master.add(introLineExpandTl(brandChars, brandInners), 0)
      master.add(introLineExpandTl(subChars, subInners), 0.36)
      master.to(
        root,
        {
          opacity: 0,
          duration: 0.55,
          ease: 'power2.inOut',
        },
        '+=0.42',
      )
    }

    void run()

    return () => {
      cancelled = true
      timelineRef.current?.kill()
      timelineRef.current = null
      gsap.killTweensOf(root)
    }
  }, [introComplete, reduced, setIntroComplete])

  if (introComplete || reduced) {
    return null
  }

  return (
    <div ref={rootRef} className="intro" role="dialog" aria-modal="true" aria-label="Loading">
      <div className="intro__veil" aria-hidden />
      <div className="intro__inner">
        <p ref={brandRef} className="intro__line">
          <CharCells text={t('common.brand')} idPrefix="brand" />
        </p>
        <p ref={subRef} className="intro__sub intro__sub--tracked">
          <CharCells text={SUB_LINE} idPrefix="sub" />
        </p>
      </div>
    </div>
  )
}
