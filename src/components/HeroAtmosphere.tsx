import gsap from 'gsap'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type RefObject,
} from 'react'

import { useI18n } from '@/contexts/I18nContext'

type RowId = '1' | '2' | '3'

const EASE_MAIN = 'power3.inOut'
const TYPE_LINE_OPACITY = 0.04
const ROW_CYCLE_INTERVAL_MS = 4200
const ROW_CYCLE_START_DELAY_MS = 700

type FloaterId =
  | 'principal'
  | 'engineer'
  | 'aiWorkflows'
  | 'react18'
  | 'nodejs'
  | 'amp'
  | 'kubernetes'
  | 'redHat'
  | 'vercelAiSdk'
  | 'productionUx'
  | 'performance'
  | 'platforms'
  | 'reliability'
  | 'delivery'
  | 'letterP'
  | 'letterR'
  | 'letterA'
  | 'letterG'
  | 'letterM'
  | 'letterT'
  | 'letterI'
  | 'letterS'
  | 'letterIntro'
  | 'agenticSystems'
  | 'enterpriseScale'
  | 'mentoring'
  | 'communities'
  | 'deploymentStat'
  | 'usersStat'
  | 'engineering'
  | 'leadership'
  | 'clarity'
  | 'execution'
  | 'automate'
  | 'iterate'

type FloaterLayoutEntry = {
  top: string
  left?: string
  right?: string
  floaterId: FloaterId
  /** Enables per-letter intro GSAP on this slot (any locale). */
  letterIntro?: boolean
}

const HERO_FLOATER_LAYOUT: FloaterLayoutEntry[] = [
  { top: '5%', left: '8%', floaterId: 'principal' },
  { top: '5%', left: '17%', floaterId: 'engineer' },
  { top: '5%', left: '30%', floaterId: 'aiWorkflows' },
  { top: '5%', left: '45%', floaterId: 'react18' },
  { top: '5%', left: '62%', floaterId: 'nodejs' },
  { top: '5%', left: '78%', floaterId: 'amp' },
  { top: '5%', left: '85%', floaterId: 'kubernetes' },
  { top: '10%', left: '12%', floaterId: 'redHat' },
  { top: '10%', left: '45%', floaterId: 'vercelAiSdk' },
  { top: '10%', right: '20%', floaterId: 'productionUx' },
  { top: '15%', left: '8%', floaterId: 'performance' },
  { top: '15%', left: '30%', floaterId: 'platforms' },
  { top: '15%', left: '55%', floaterId: 'reliability' },
  { top: '15%', right: '20%', floaterId: 'delivery' },
  { top: '25%', left: '10%', floaterId: 'letterP' },
  { top: '30%', left: '15%', floaterId: 'letterR' },
  { top: '25%', left: '20%', floaterId: 'letterA' },
  { top: '30%', left: '30%', floaterId: 'letterG' },
  { top: '25%', left: '35%', floaterId: 'letterM' },
  { top: '30%', left: '40%', floaterId: 'letterA' },
  { top: '25%', left: '50%', floaterId: 'letterT' },
  { top: '30%', left: '55%', floaterId: 'letterI' },
  { top: '25%', left: '60%', floaterId: 'letterS' },
  { top: '30%', left: '70%', floaterId: 'letterM' },
  { top: '25%', right: '5%', floaterId: 'letterIntro', letterIntro: true },
  { top: '35%', left: '25%', floaterId: 'agenticSystems' },
  { top: '35%', left: '65%', floaterId: 'enterpriseScale' },
  { top: '50%', left: '5%', floaterId: 'mentoring' },
  { top: '50%', right: '5%', floaterId: 'communities' },
  { top: '75%', left: '20%', floaterId: 'deploymentStat' },
  { top: '75%', right: '20%', floaterId: 'usersStat' },
  { top: '80%', left: '10%', floaterId: 'engineering' },
  { top: '80%', left: '35%', floaterId: 'leadership' },
  { top: '80%', left: '65%', floaterId: 'clarity' },
  { top: '80%', right: '10%', floaterId: 'execution' },
  { top: '85%', left: '25%', floaterId: 'automate' },
  { top: '85%', right: '25%', floaterId: 'iterate' },
]

const HERO_FLOATER_IDS: FloaterId[] = Array.from(
  new Set(HERO_FLOATER_LAYOUT.map((e) => e.floaterId)),
)

const KINETIC_LINE_KINDS = [
  'engineer',
  'systems',
  'mentor',
  'engineer',
  'systems',
  'engineer',
  'engineer',
  'systems',
  'mentor',
  'engineer',
  'systems',
  'engineer',
] as const

const CHAR_STAGGER = 0.04
const REST_INNER_X = -1
const EXPANDED_INNER_X = -55

export function HeroAtmosphere({
  sectionRef,
  reducedMotion,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  children?: ReactNode
}) {
  const [activeRowId, setActiveRowId] = useState<RowId | null>(null)
  const activeRowIdRef = useRef<RowId | null>(null)
  const textBgRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<RowId, HTMLDivElement | null>>({
    1: null,
    2: null,
    3: null,
  })
  const kineticRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const typeLineRefs = useRef<HTMLElement[]>([])
  const textItemsRef = useRef<HTMLElement[]>([])
  const kineticTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const transitionInProgressRef = useRef(false)

  const { t } = useI18n()

  const { floaterSlots, alternativeByRow, heroRows, kineticSeedLines } = useMemo(() => {
    const prefix = 'pages.home.heroAtmosphere.floaters'
    const altRow: Record<RowId, Record<string, string>> = { '1': {}, '2': {}, '3': {} }
    for (const id of HERO_FLOATER_IDS) {
      const base = t(`${prefix}.${id}.base`)
      altRow['1'][base] = t(`${prefix}.${id}.alt1`)
      altRow['2'][base] = t(`${prefix}.${id}.alt2`)
      altRow['3'][base] = t(`${prefix}.${id}.alt3`)
    }
    const rows: { id: RowId; label: string }[] = (['1', '2', '3'] as const).map(
      (id) => ({ id, label: t(`pages.home.heroAtmosphere.rows.${id}`) }),
    )
    const kineticWords = {
      engineer: t('pages.home.heroAtmosphere.kinetic.engineer').toLowerCase(),
      systems: t('pages.home.heroAtmosphere.kinetic.systems').toLowerCase(),
      mentor: t('pages.home.heroAtmosphere.kinetic.mentor').toLowerCase(),
    }
    const lines = KINETIC_LINE_KINDS.map((kind) => {
      const w = kineticWords[kind]
      return `${w} ${w} ${w}`
    })
    const slots = HERO_FLOATER_LAYOUT.map((entry, index) => ({
      reactKey: `${index}-${entry.floaterId}`,
      top: entry.top,
      left: entry.left,
      right: entry.right,
      text: t(`${prefix}.${entry.floaterId}.base`),
      letterIntro: entry.letterIntro === true,
    }))
    return {
      floaterSlots: slots,
      alternativeByRow: altRow,
      heroRows: rows,
      kineticSeedLines: lines,
    }
  }, [t])

  useLayoutEffect(() => {
    if (!textBgRef.current) return
    textItemsRef.current = Array.from(
      textBgRef.current.querySelectorAll<HTMLElement>('.hero-atmosphere__text-item'),
    )
  }, [floaterSlots])

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!kineticRef.current) return
      typeLineRefs.current = Array.from(
        kineticRef.current.querySelectorAll<HTMLElement>('.hero-atmosphere__type-line'),
      )
    })
    return () => cancelAnimationFrame(id)
  }, [kineticSeedLines])

  useLayoutEffect(() => {
    if (reducedMotion) return

    const measureChars = async () => {
      await document.fonts.ready.catch(() => undefined)

      const isMobile = window.innerWidth < 1024

        ; (['1', '2', '3'] as const satisfies readonly RowId[]).forEach((rowId) => {
          const row = rowRefs.current[rowId]
          if (!row) return
          const textEl = row.querySelector<HTMLElement>('.hero-atmosphere__text-content')
          if (!textEl) return

          const computedStyle = window.getComputedStyle(textEl)
          const currentFontSize = computedStyle.fontSize
          const fontFamily = computedStyle.fontFamily || '"Longsile", sans-serif'
          const chars = Array.from(row.querySelectorAll('.hero-atmosphere__char')) as HTMLElement[]

          chars.forEach((char, i) => {
            let inner = char.querySelector('.hero-atmosphere__char-inner') as HTMLElement | null
            let charText = inner?.textContent ?? char.textContent ?? ''
            charText = charText.replace(/\u00a0/g, ' ')
            if (!charText.trim() && charText.length === 0) return

            if (!inner) {
              char.textContent = ''
              inner = document.createElement('span')
              inner.className = 'hero-atmosphere__char-inner'
              inner.textContent = charText
              char.appendChild(inner)
            }
            gsap.set(inner, { x: REST_INNER_X })

            let charWidth: number

            if (isMobile) {
              const fontSizeValue = Number.parseFloat(currentFontSize)
              charWidth = fontSizeValue * 0.6
            } else {
              const tempSpan = document.createElement('span')
              tempSpan.style.cssText =
                'position:absolute;visibility:hidden;white-space:pre;font-size:inherit;font-family:inherit;font-weight:inherit;letter-spacing:inherit;text-transform:inherit'
              tempSpan.style.fontSize = currentFontSize
              tempSpan.style.fontFamily = fontFamily
              tempSpan.textContent = charText === ' ' ? '\u00a0' : charText
              document.body.appendChild(tempSpan)

              const actualWidth = tempSpan.offsetWidth
              document.body.removeChild(tempSpan)

              const fontSizeValue = Number.parseFloat(currentFontSize)
              const fontSizeRatio = Math.max(fontSizeValue / 160, 0.12)
              const padding = 10 * fontSizeRatio
              charWidth = Math.max(actualWidth + padding, 30 * fontSizeRatio)
            }

            char.style.width = `${charWidth}px`
            char.style.maxWidth = `${charWidth}px`
            char.dataset.charWidth = String(charWidth)
            const fontSizeValue = Number.parseFloat(currentFontSize)
            const fontSizeRatio = Math.max(fontSizeValue / 160, 0.12)
            const hoverWidth = Math.max(charWidth * 1.8, 85 * fontSizeRatio)
            char.dataset.hoverWidth = String(hoverWidth)
            char.style.setProperty('--char-index', String(i))
          })
        })
    }

    void measureChars()

    let resizeTimer: number
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        void measureChars()
      }, 250)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [reducedMotion, heroRows])

  const forceResetKinetic = useCallback(() => {
    kineticTimelineRef.current?.kill()
    kineticTimelineRef.current = null

    const kineticType = kineticRef.current
    const typeLines = typeLineRefs.current
    const oddLines = typeLines.filter((_, i) => i % 2 === 0)
    const evenLines = typeLines.filter((_, i) => i % 2 === 1)

    if (kineticType) gsap.killTweensOf([kineticType, typeLines])
    gsap.set(kineticType, { display: 'grid', scale: 1, rotation: 0, opacity: 1 })
    gsap.set(typeLines, { opacity: TYPE_LINE_OPACITY, x: '0%' })
    gsap.set(oddLines, { clearProps: 'x' })
    gsap.set(evenLines, { clearProps: 'x' })
  }, [])

  const startKineticAnimation = useCallback(
    (text: string) => {
      forceResetKinetic()

      const kineticType = kineticRef.current
      if (kineticType && typeLineRefs.current.length === 0) {
        typeLineRefs.current = Array.from(
          kineticType.querySelectorAll<HTMLElement>('.hero-atmosphere__type-line'),
        )
      }

      const typeLines = typeLineRefs.current
      if (!kineticType || typeLines.length === 0) return

      const oddLines = typeLines.filter((_, i) => i % 2 === 0)
      const evenLines = typeLines.filter((_, i) => i % 2 === 1)
      const repeated = `${text} ${text} ${text}`

      typeLines.forEach((line) => {
        line.textContent = repeated
      })

      gsap.delayedCall(0.02, () => {
        const timeline = gsap.timeline()

        timeline.to(kineticType, {
          duration: 1.4,
          ease: EASE_MAIN,
          scale: 2.7,
          rotation: -90,
        })

        timeline.to(
          oddLines,
          {
            keyframes: [
              { x: '20%', duration: 1, ease: EASE_MAIN },
              { x: '-200%', duration: 1.5, ease: EASE_MAIN },
            ],
            stagger: 0.08,
          },
          0,
        )

        timeline.to(
          evenLines,
          {
            keyframes: [
              { x: '-20%', duration: 1, ease: EASE_MAIN },
              { x: '200%', duration: 1.5, ease: EASE_MAIN },
            ],
            stagger: 0.08,
          },
          0,
        )

        timeline.to(
          typeLines,
          {
            keyframes: [
              { opacity: 0.28, duration: 1, ease: EASE_MAIN },
              { opacity: 0, duration: 1.5, ease: EASE_MAIN },
            ],
            stagger: 0.05,
          },
          0,
        )

        kineticTimelineRef.current = timeline
      })
    },
    [forceResetKinetic],
  )

  const createTextRevealAnimation = useCallback((rowId: RowId) => {
    const items = textItemsRef.current
    const content = contentRef.current
    const alt = alternativeByRow[rowId]
    const timeline = gsap.timeline()

    timeline.to(items, { opacity: 0.3, duration: 0.5, ease: EASE_MAIN })
    if (content) {
      timeline.to(content, { opacity: 0.72, duration: 0.5, ease: EASE_MAIN }, 0)
    }
    timeline.add(() => {
      items.forEach((item) => item.classList.add('hero-atmosphere__text-item--highlight'))
      content?.classList.add('hero-atmosphere__content--highlight')
    })
    timeline.add(() => {
      items.forEach((item) => {
        const key = item.dataset.text ?? ''
        const next = alt?.[key]
        if (next !== undefined) {
          item.textContent = next
        }
      })
    }, '+=0.35')
    timeline.add(() => {
      items.forEach((item) => {
        item.classList.remove('hero-atmosphere__text-item--highlight')
        item.classList.add('hero-atmosphere__text-item--highlight-reverse')
      })
      content?.classList.remove('hero-atmosphere__content--highlight')
      content?.classList.add('hero-atmosphere__content--highlight-reverse')
    })
    timeline.add(() => {
      items.forEach((item) => {
        item.classList.remove('hero-atmosphere__text-item--highlight-reverse')
      })
      content?.classList.remove('hero-atmosphere__content--highlight-reverse')
    }, '+=0.45')
    if (content) {
      timeline.to(content, { opacity: 1, duration: 0.5, ease: EASE_MAIN }, '<')
    }
    return timeline
  }, [alternativeByRow])

  const textRevealRef = useRef<gsap.core.Timeline | null>(null)

  const activateRow = useCallback(
    (row: HTMLDivElement) => {
      const rowId = row.dataset.rowId as RowId
      if (!rowId || transitionInProgressRef.current) return
      if (activeRowIdRef.current === rowId) return

      const prevId = activeRowIdRef.current
      const prevRow = prevId ? rowRefs.current[prevId] : null
      const kineticText = (
        heroRows.find((candidate) => candidate.id === rowId)?.label ?? rowId
      ).toLowerCase()

      const playRowExpand = (targetRow: HTMLDivElement) => {
        const chars = targetRow.querySelectorAll<HTMLElement>('.hero-atmosphere__char')
        const inners = targetRow.querySelectorAll<HTMLElement>('.hero-atmosphere__char-inner')
        gsap.to(chars, {
          maxWidth: (_i: number, target: HTMLElement) =>
            Number.parseFloat(target.dataset.hoverWidth ?? '80'),
          duration: 0.64,
          stagger: CHAR_STAGGER,
          ease: EASE_MAIN,
        })
        gsap.to(inners, {
          x: EXPANDED_INNER_X,
          duration: 0.64,
          stagger: CHAR_STAGGER,
          ease: EASE_MAIN,
          delay: 0.05,
        })
      }

      const playRowCollapse = (
        outgoingRow: HTMLDivElement,
        timeline: gsap.core.Timeline,
        position = 0,
        collapseFrom: 'start' | 'end' = 'end',
      ) => {
        const fromChars = outgoingRow.querySelectorAll<HTMLElement>('.hero-atmosphere__char')
        const fromInners = outgoingRow.querySelectorAll<HTMLElement>('.hero-atmosphere__char-inner')
        gsap.killTweensOf([fromChars, fromInners])
        const staggerIn =
          collapseFrom === 'end'
            ? { each: CHAR_STAGGER, from: 'end' as const }
            : { each: CHAR_STAGGER, from: 'start' as const }
        timeline.to(
          fromChars,
          {
            maxWidth: (_i: number, target: HTMLElement) =>
              Number.parseFloat(target.dataset.charWidth ?? '40'),
            duration: 0.64,
            stagger: staggerIn,
            ease: EASE_MAIN,
          },
          position,
        )
        timeline.to(
          fromInners,
          {
            x: REST_INNER_X,
            duration: 0.64,
            stagger: staggerIn,
            ease: EASE_MAIN,
          },
          position + 0.05,
        )
      }

      if (prevRow && prevId && prevRow !== row) {
        transitionInProgressRef.current = true
        prevRow.classList.remove('hero-atmosphere__text-row--active')

        forceResetKinetic()
        textRevealRef.current?.kill()

        activeRowIdRef.current = rowId
        setActiveRowId(rowId)
        row.classList.add('hero-atmosphere__text-row--active')

        startKineticAnimation(kineticText)
        textRevealRef.current = createTextRevealAnimation(rowId)

        const prevIdx = heroRows.findIndex((r) => r.id === prevId)
        const nextIdx = heroRows.findIndex((r) => r.id === rowId)
        const backwardInOrder =
          nextIdx !== -1 && prevIdx !== -1 && nextIdx < prevIdx
        const expandOrigin = backwardInOrder ? 'end' : 'start'
        const collapseFrom: 'start' | 'end' = backwardInOrder ? 'start' : 'end'

        const toChars = row.querySelectorAll<HTMLElement>('.hero-atmosphere__char')
        const toInners = row.querySelectorAll<HTMLElement>('.hero-atmosphere__char-inner')
        const rowTl = gsap.timeline({
          onComplete: () => {
            transitionInProgressRef.current = false
          },
        })
        playRowCollapse(prevRow, rowTl, 0, collapseFrom)
        rowTl.to(
          toChars,
          {
            maxWidth: (_i: number, target: HTMLElement) =>
              Number.parseFloat(target.dataset.hoverWidth ?? '80'),
            duration: 0.64,
            stagger:
              expandOrigin === 'end'
                ? { each: CHAR_STAGGER, from: 'end' }
                : CHAR_STAGGER,
            ease: EASE_MAIN,
          },
          0,
        )
        rowTl.to(
          toInners,
          {
            x: EXPANDED_INNER_X,
            duration: 0.64,
            stagger:
              expandOrigin === 'end'
                ? { each: CHAR_STAGGER, from: 'end' }
                : CHAR_STAGGER,
            ease: EASE_MAIN,
          },
          0.05,
        )
        return
      }

      activeRowIdRef.current = rowId
      setActiveRowId(rowId)
      row.classList.add('hero-atmosphere__text-row--active')

      startKineticAnimation(kineticText)

      textRevealRef.current?.kill()
      textRevealRef.current = createTextRevealAnimation(rowId)

      playRowExpand(row)
    },
    [createTextRevealAnimation, forceResetKinetic, heroRows, startKineticAnimation],
  )

  useEffect(() => {
    if (reducedMotion) return

    const rowOrder = heroRows.map((row) => row.id)
    if (rowOrder.length === 0) return

    const pingPongIndices: number[] = []
    for (let i = 0; i < rowOrder.length; i += 1) {
      pingPongIndices.push(i)
    }
    for (let i = rowOrder.length - 2; i >= 0; i -= 1) {
      pingPongIndices.push(i)
    }

    let sequenceStep = 0
    let intervalId: number | undefined

    const runCycle = () => {
      const idx = pingPongIndices[sequenceStep % pingPongIndices.length] ?? 0
      const nextId = rowOrder[idx]
      const nextRow = rowRefs.current[nextId]
      if (nextRow) {
        activateRow(nextRow)
      }
      sequenceStep += 1
    }

    const startTimer = window.setTimeout(() => {
      runCycle()
      intervalId = window.setInterval(runCycle, ROW_CYCLE_INTERVAL_MS)
    }, ROW_CYCLE_START_DELAY_MS)

    return () => {
      window.clearTimeout(startTimer)
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [activateRow, heroRows, reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const items = textItemsRef.current
    items.forEach((item) => {
      const text = item.dataset.text ?? item.textContent ?? ''
      item.dataset.originalText = text
      gsap.set(item, { opacity: 1 })
    })

    const simplicity = textItemsRef.current.find((el) => el.dataset.letterIntro === 'true')
    if (simplicity) {
      const letters = simplicity.textContent?.split('') ?? []
      simplicity.textContent = ''
      letters.forEach((ch) => {
        const s = document.createElement('span')
        s.textContent = ch
        s.style.display = 'inline-block'
        simplicity.appendChild(s)
      })
      gsap.from(simplicity.children, {
        opacity: 0,
        scale: 0.5,
        duration: 1,
        stagger: 0.015,
        ease: EASE_MAIN,
        delay: 0.6,
      })
    }

    items.forEach((item, index) => {
      const delay = index * 0.08
      gsap.to(item, {
        opacity: 0.85,
        duration: 2 + (index % 3),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay,
      })
    })

      ; (['1', '2', '3'] as const satisfies readonly RowId[]).forEach((rowId, rowIndex) => {
        const row = rowRefs.current[rowId]
        if (!row) return
        const chars = row.querySelectorAll<HTMLElement>('.hero-atmosphere__char')
        gsap.set(chars, { opacity: 0, filter: 'blur(12px)' })
        gsap.to(chars, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.09,
          ease: EASE_MAIN,
          delay: 0.12 * rowIndex + 0.4,
        })
      })

    return () => {
      textRevealRef.current?.kill()
      kineticTimelineRef.current?.kill()
      gsap.killTweensOf(items)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const section = sectionRef.current
    if (!section) return

    const parallaxTargets: HTMLElement[] = [...textItemsRef.current].filter(
      (el): el is HTMLElement => Boolean(el),
    )

    const speeds = [0.02, 0.03, 0.04, 0.05]
    parallaxTargets.forEach((el, index) => {
      el.dataset.parallaxSpeed = String(speeds[index % speeds.length])
      gsap.set(el, { transformOrigin: 'center center', force3D: true })
    })

    let lastT = 0
    const throttle = 24

    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastT < throttle) return
      lastT = now

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const offsetX = (e.clientX - centerX) / centerX
      const offsetY = (e.clientY - centerY) / centerY

      parallaxTargets.forEach((el) => {
        const speed = Number.parseFloat(el.dataset.parallaxSpeed ?? '0.03')
        const id = el.id || ''
        if (id.endsWith('-bg')) {
          const op = window.getComputedStyle(el).opacity
          if (op === '0' || Number.parseFloat(op) < 0.02) return
        }
        const moveX = offsetX * 60 * speed
        const moveY = offsetY * 36 * speed
        gsap.to(el, { x: moveX, y: moveY, duration: 1, ease: 'power2.out', overwrite: 'auto' })
      })
    }

    const onLeave = () => {
      parallaxTargets.forEach((el) => {
        gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: EASE_MAIN })
      })
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)

    const floaters = gsap.context(() => {
      parallaxTargets.forEach((el, index) => {
        const delay = index * 0.12
        const floatAmount = 4 + (index % 3) * 2
        gsap.to(el, {
          y: `+=${floatAmount}`,
          duration: 3 + (index % 2),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay,
        })
      })
    }, section)

    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      floaters.revert()
    }
  }, [reducedMotion, sectionRef])

  return (
    <>
      <div
        className={`hero-atmosphere${reducedMotion ? ' hero-atmosphere--reduced' : ''}`}
        aria-hidden="true"
      >
        <div className="hero-atmosphere__gradient-bottom" />

        <div ref={textBgRef} className="hero-atmosphere__text-bg">
          {floaterSlots.map((item) => (
            <div
              key={item.reactKey}
              className="hero-atmosphere__text-item"
              style={{
                top: item.top,
                ...(item.left !== undefined ? { left: item.left } : {}),
                ...(item.right !== undefined ? { right: item.right } : {}),
              }}
              data-text={item.text}
              data-letter-intro={item.letterIntro ? 'true' : undefined}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div className="hero-atmosphere__main">
          <div className="hero-atmosphere__sliced">
            {heroRows.map((row) => (
              <div
                key={row.id}
                ref={(el) => {
                  rowRefs.current[row.id] = el
                }}
                className={`hero-atmosphere__text-row${activeRowId === row.id ? ' hero-atmosphere__text-row--active' : ''}`}
                data-row-id={row.id}
              >
                <div className="hero-atmosphere__text-content" data-text={row.label}>
                  {row.label.split('').map((ch, i) => (
                    <span
                      key={`${row.id}-${i}-${ch}`}
                      className="hero-atmosphere__char"
                      style={{ '--char-index': i } as CSSProperties}
                    >
                      <span className="hero-atmosphere__char-inner">{ch}</span>
                    </span>
                  ))}
                </div>
                <div
                  className="hero-atmosphere__hit"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>

        <div ref={kineticRef} className="hero-atmosphere__kinetic" id="kinetic-type">
          {kineticSeedLines.map((line, index) => (
            <div
              key={index}
              className={`hero-atmosphere__type-line ${index % 2 === 0 ? 'hero-atmosphere__type-line--odd' : 'hero-atmosphere__type-line--even'}`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      <div
        ref={contentRef}
        className="zoom-hero__grid hero-atmosphere__content"
      >
        {children}
      </div>
    </>
  )
}
