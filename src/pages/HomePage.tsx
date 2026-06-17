import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { HomeBookshelfSection } from '@/components/HomeBookshelfSection'
import { HomeExperimentsSection } from '@/components/HomeExperimentsSection'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { useI18n } from '@/contexts/I18nContext'
import { bookshelf } from '@/data/bookshelfData'
import { homeExperiments } from '@/data/experimentsData'
import { talks } from '@/data/talksData'
import { writings } from '@/data/writingsData'
import { useHomeStripScroll } from '@/hooks/useHomeStripScroll'
import { useHomePanelReveal } from '@/hooks/useHomePanelReveal'
import { useHomePanelTheme } from '@/hooks/useHomePanelTheme'
import { useHomeScrollParallax } from '@/hooks/useHomeScrollParallax'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hrefWriting, hrefWritings } from '@/i18n/routes'
import { lenisService } from '@/services/lenisService'
import { formatWritingDate } from '@/utils/formatWritingDate'
import { preloadImages } from '@/utils/imagePreloadCache'

const HOME_WRITINGS_PREVIEW_COUNT = 8
const HERO_TUNER_ENABLED = import.meta.env.DEV

type HeroTuneValue = {
  x: number
  y: number
  rotate: number
  scale: number
}

const HERO_TUNE_DEFAULT: HeroTuneValue = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
}

const getHeroFloatProfile = (number: string, index: number) => {
  const seed = Number.parseInt(number, 10) || index + 1
  const xDirection = seed % 2 === 0 ? -1 : 1
  const yDirection = seed % 3 === 0 ? -1 : 1
  const crossDirection = seed % 4 < 2 ? 1 : -1

  return {
    x: (11 + (seed % 7) * 2.4 + index * 0.22) * xDirection,
    y: (8 + (seed % 5) * 2.1 + index * 0.18) * yDirection,
    crossX: (2.5 + (seed % 4) * 1.35) * crossDirection,
    crossY: (1.8 + (seed % 6) * 0.85) * -crossDirection,
    duration: 0.48 + (seed % 6) * 0.055,
  }
}

const HERO_COLLAGE_ITEMS = [
  {
    id: 'open-magazine',
    number: '1',
    src: '/media/hero/open-magazine-spread.png',
    shape: 'magazine',
    group: 'books',
    tone: 'paper',
    tune: { x: -21, y: 11, rotate: 0, scale: 1 },
  },
  {
    id: 'writing-board',
    number: '2',
    src: '/media/hero/writing-collage-board.png',
    shape: 'writing-board',
    group: 'books',
    tone: 'paper',
    tune: { x: 150, y: -7, rotate: 13, scale: 0.98 },
  },
  {
    id: 'prince-book',
    number: '3',
    src: '/media/hero/prince-of-persia-book.png',
    shape: 'prince-book',
    group: 'books',
    tone: 'solid',
    tune: { x: 0, y: 0, rotate: 0, scale: 1 },
  },
  {
    id: 'field-notes',
    number: '4',
    src: '/media/hero/field-notes-pitch-black.webp',
    shape: 'field-notes',
    group: 'books',
    tone: 'solid',
    tune: { x: -20, y: -48, rotate: -8, scale: 2.21 },
  },
  {
    id: 'red-table-lamp',
    number: '5',
    src: '/media/hero/red-table-lamp.png',
    shape: 'table-lamp',
    group: 'lamps',
    tone: 'light-bg',
    tune: { x: 650, y: 92, rotate: -20, scale: 1 },
  },
  {
    id: 'dyson-solarcycle',
    number: '6',
    src: '/media/hero/dyson-solarcycle-floor.webp',
    shape: 'dyson-lamp',
    group: 'lamps',
    tone: 'solid',
    tune: { x: 187, y: 36, rotate: -5, scale: 2.34 },
  },
  {
    id: 'flos-bellhop',
    number: '7',
    src: '/media/hero/flos-bellhop-table.webp',
    shape: 'bellhop-lamp',
    group: 'lamps',
    tone: 'solid',
    tune: { x: 456, y: 97, rotate: 0, scale: 1.66 },
  },
  {
    id: 'flos-taccia',
    number: '8',
    src: '/media/hero/flos-taccia.webp',
    shape: 'taccia-lamp',
    group: 'lamps',
    tone: 'solid',
    tune: { x: -99, y: -303, rotate: -3, scale: 1.46 },
  },
  {
    id: 'anglepoise',
    number: '9',
    src: '/media/hero/anglepoise-type75.webp',
    shape: 'anglepoise-lamp',
    group: 'lamps',
    tone: 'solid',
    tune: { x: -15, y: 0, rotate: 0, scale: 1.17 },
  },
  {
    id: 'clockclock',
    number: '11',
    src: '/media/hero/clockclock-24.webp',
    shape: 'clockclock',
    group: 'devices',
    tone: 'solid',
    tune: { x: 23, y: 0, rotate: 0, scale: 1 },
  },
  {
    id: 'sony-headphones',
    number: '12',
    src: '/media/hero/sony-wh1000xm6.webp',
    shape: 'headphones',
    group: 'audio',
    tone: 'solid',
    tune: { x: 63, y: -68, rotate: 0, scale: 1 },
  },
  {
    id: 'void-watch',
    number: '13',
    src: '/media/hero/void-v02mkii.webp',
    shape: 'void-watch',
    group: 'wearables',
    tone: 'solid',
    tune: { x: -29, y: 0, rotate: 0, scale: 1 },
  },
  {
    id: 'analogue-pocket',
    number: '14',
    src: '/media/hero/analogue-pocket.webp',
    shape: 'analogue-pocket',
    group: 'devices',
    tone: 'solid',
    tune: { x: 75, y: 8, rotate: 0, scale: 1.18 },
  },
  {
    id: 'braun-watch',
    number: '15',
    src: '/media/hero/braun-bn0021.webp',
    shape: 'braun-watch',
    group: 'wearables',
    tone: 'solid',
    tune: { x: 500, y: -22, rotate: 0, scale: 1 },
  },
  {
    id: 'dji-action',
    number: '16',
    src: '/media/hero/dji-action-2.webp',
    shape: 'dji-action',
    group: 'cameras',
    tone: 'solid',
    tune: { x: 63, y: 126, rotate: 0, scale: 1 },
  },
  {
    id: 'lamy-pico',
    number: '17',
    src: '/media/hero/lamy-pico-pen.webp',
    shape: 'lamy-pen',
    group: 'desk',
    tone: 'solid',
    tune: { x: 127, y: 25, rotate: 0, scale: 1.28 },
  },
  {
    id: 'tk-demi',
    number: '18',
    src: '/media/hero/tk-demi.webp',
    shape: 'tk-demi',
    group: 'desk',
    tone: 'solid',
    tune: { x: 94, y: 55, rotate: 0, scale: 1 },
  },
  {
    id: 'lego-ferrari',
    number: '19',
    src: '/media/hero/lego-ferrari-sf24.webp',
    shape: 'lego-ferrari',
    group: 'objects',
    tone: 'solid',
    tune: { x: 0, y: 0, rotate: 0, scale: 1 },
  },
  {
    id: 'lego-batmobile',
    number: '20',
    src: '/media/hero/lego-1989-batmobile.webp',
    shape: 'lego-batmobile',
    group: 'objects',
    tone: 'solid',
    tune: { x: -81, y: 42, rotate: -7, scale: 1 },
  },
  {
    id: 'onitsuka-tiger',
    number: '21',
    src: '/media/hero/onitsuka-tiger-mexico66.webp',
    shape: 'onitsuka-shoe',
    group: 'objects',
    tone: 'solid',
    tune: { x: -81, y: -46, rotate: 0, scale: 1 },
  },
  {
    id: 'craighill-eyewear',
    number: '22',
    src: '/media/hero/craighill-eyewear-stand.webp',
    shape: 'eyewear-stand',
    group: 'desk',
    tone: 'solid',
    tune: { x: 60, y: 117, rotate: 0, scale: 1 },
  },
  {
    id: 'midori-notebook',
    number: '23',
    src: '/media/hero/midori-md-notebook-a5.webp',
    shape: 'midori-notebook',
    group: 'books',
    tone: 'solid',
    tune: { x: 52, y: 5, rotate: 0, scale: 1.99 },
  },
  {
    id: 'lego-porsche',
    number: '24',
    src: '/media/hero/lego-porsche-911.webp',
    shape: 'lego-porsche',
    group: 'objects',
    tone: 'solid',
    tune: { x: 17, y: 89, rotate: 13, scale: 1 },
  },
  {
    id: 'lego-shelby',
    number: '25',
    src: '/media/hero/lego-shelby-cobra.webp',
    shape: 'lego-shelby',
    group: 'objects',
    tone: 'solid',
    tune: { x: -43, y: -51, rotate: 0, scale: 1 },
  },
  {
    id: 'lego-f40',
    number: '26',
    src: '/media/hero/lego-ferrari-f40.webp',
    shape: 'lego-f40',
    group: 'objects',
    tone: 'solid',
    tune: { x: 29, y: -22, rotate: 3, scale: 1.04 },
  },
] as const

gsap.registerPlugin(useGSAP)

const HASH_SECTION_IDS: Record<string, string> = {
  '#experiments': 'experiments',
  '#writings': 'writings',
  '#talks': 'talks',
  '#books': 'books',
}

export function HomePage() {
  const { t } = useI18n()
  const panelsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const experimentsTrackRef = useRef<HTMLDivElement>(null)
  const experimentsStripRef = useRef<HTMLUListElement>(null)
  const booksTrackRef = useRef<HTMLDivElement>(null)
  const booksStripRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const location = useLocation()
  const experimentsScrubHorizontal = !reducedMotion && homeExperiments.length > 0
  const booksScrubHorizontal = !reducedMotion && bookshelf.length > 0
  const [activeHeroTuneNumber, setActiveHeroTuneNumber] = useState<string>(
    HERO_COLLAGE_ITEMS[0].number,
  )
  const [heroTune, setHeroTune] = useState<Record<string, HeroTuneValue>>({})
  const [isHeroTunerOpen, setIsHeroTunerOpen] = useState(false)
  const activeHeroTuneItem = HERO_COLLAGE_ITEMS.find(
    (item) => item.number === activeHeroTuneNumber,
  )
  const activeHeroTune = activeHeroTuneItem
    ? (heroTune[activeHeroTuneNumber] ?? activeHeroTuneItem.tune)
    : HERO_TUNE_DEFAULT
  const currentHeroTune = Object.fromEntries(
    HERO_COLLAGE_ITEMS.map((item) => [item.number, heroTune[item.number] ?? item.tune]),
  ) as Record<string, HeroTuneValue>

  const updateHeroTune = (patch: Partial<HeroTuneValue>) => {
    setHeroTune((prev) => ({
      ...prev,
      [activeHeroTuneNumber]: {
        ...(activeHeroTuneItem?.tune ?? HERO_TUNE_DEFAULT),
        ...activeHeroTune,
        ...patch,
      },
    }))
  }

  const resetHeroTuneItem = () => {
    setHeroTune((prev) => {
      const next = { ...prev }
      delete next[activeHeroTuneNumber]
      return next
    })
  }

  useHomeStripScroll({
    rootRef: panelsRef,
    experimentsTrackRef,
    experimentsStripRef,
    booksTrackRef,
    booksStripRef,
    enabled: experimentsScrubHorizontal || booksScrubHorizontal,
    experimentsEnabled: experimentsScrubHorizontal,
    booksEnabled: booksScrubHorizontal,
  })

  useHomePanelTheme({
    rootRef: panelsRef,
    reducedMotion,
  })

  useHomePanelReveal({
    rootRef: panelsRef,
    reducedMotion,
  })

  useHomeScrollParallax({
    rootRef: panelsRef,
    reducedMotion,
  })

  useGSAP(
    () => {
      const hero = heroRef.current
      if (!hero) return

      const targets = hero.querySelectorAll<HTMLElement>('[data-home-hero-animate]')
      if (!targets.length) return

      if (reducedMotion) {
        gsap.set(targets, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          clearProps: 'transform,visibility',
        })
        return
      }

      gsap.set(targets, {
        autoAlpha: 0,
        y: 22,
        filter: 'blur(10px)',
      })

      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.075,
        delay: 0.18,
      })
    },
    { scope: heroRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      const hero = heroRef.current
      if (!hero || reducedMotion) return

      const focusCard = hero.querySelector<HTMLElement>('[data-home-focus-card]')
      if (!focusCard) return

      const handleCardPointerMove = (event: PointerEvent) => {
        const rect = focusCard.getBoundingClientRect()
        focusCard.style.setProperty('--focus-glow-x', `${event.clientX - rect.left}px`)
        focusCard.style.setProperty('--focus-glow-y', `${event.clientY - rect.top}px`)
      }

      focusCard.addEventListener('pointermove', handleCardPointerMove)

      return () => {
        focusCard.removeEventListener('pointermove', handleCardPointerMove)
      }
    },
    { scope: panelsRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      const hero = heroRef.current
      if (!hero || reducedMotion) return

      const floaters = Array.from(
        hero.querySelectorAll<HTMLElement>('[data-home-hero-float]'),
      )
      if (!floaters.length) return

      const setters = floaters.map((el) => {
        const duration = Number.parseFloat(el.dataset.floatDuration ?? '0.7')

        return {
          x: gsap.quickTo(el, 'x', { duration, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: duration + 0.08, ease: 'power3.out' }),
          axisX: Number.parseFloat(el.dataset.floatX ?? '18'),
          axisY: Number.parseFloat(el.dataset.floatY ?? '13'),
          crossX: Number.parseFloat(el.dataset.floatCrossX ?? '0'),
          crossY: Number.parseFloat(el.dataset.floatCrossY ?? '0'),
        }
      })

      const handlePointerMove = (event: PointerEvent) => {
        const rect = hero.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5

        setters.forEach((setter) => {
          setter.x(x * setter.axisX + y * setter.crossX)
          setter.y(y * setter.axisY + x * setter.crossY)
        })
      }

      const resetFloaters = () => {
        setters.forEach((setter) => {
          setter.x(0)
          setter.y(0)
        })
      }

      hero.addEventListener('pointermove', handlePointerMove)
      hero.addEventListener('pointerleave', resetFloaters)

      return () => {
        hero.removeEventListener('pointermove', handlePointerMove)
        hero.removeEventListener('pointerleave', resetFloaters)
      }
    },
    { scope: heroRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      const hero = heroRef.current
      if (!hero || reducedMotion) return

      const cutouts = Array.from(
        hero.querySelectorAll<HTMLElement>('[data-home-hero-scroll-exit]'),
      )
      if (!cutouts.length) return

      let frame = 0
      let profiles: Array<{ el: HTMLElement; x: number; y: number; rotate: number }> = []

      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max)

      const resetExitVars = () => {
        cutouts.forEach((cutout) => {
          cutout.style.setProperty('--cutout-exit-x', '0px')
          cutout.style.setProperty('--cutout-exit-y', '0px')
          cutout.style.setProperty('--cutout-exit-rotate', '0deg')
          cutout.style.setProperty('--cutout-exit-scale', '1')
        })
      }

      const measureProfiles = () => {
        resetExitVars()

        const heroRect = hero.getBoundingClientRect()
        const centerX = heroRect.left + heroRect.width / 2
        const centerY = heroRect.top + heroRect.height / 2

        profiles = cutouts.map((cutout, index) => {
          const art = cutout.querySelector<HTMLElement>('.home-hero-editorial__cutout-art')
          const rect = (art ?? cutout).getBoundingClientRect()
          const dx = rect.left + rect.width / 2 - centerX
          const dy = rect.top + rect.height / 2 - centerY
          const length = Math.hypot(dx, dy) || 1
          const fallbackAngle = (index / cutouts.length) * Math.PI * 2
          const unitX = length > 1 ? dx / length : Math.cos(fallbackAngle)
          const unitY = length > 1 ? dy / length : Math.sin(fallbackAngle)
          const travel = 120 + (index % 6) * 18

          return {
            el: cutout,
            x: unitX * travel,
            y: unitY * travel,
            rotate: (index % 2 === 0 ? 1 : -1) * (5 + (index % 5) * 1.5),
          }
        })
      }

      const updateExit = () => {
        frame = 0
        const rect = hero.getBoundingClientRect()
        const progress = clamp(-rect.top / (rect.height * 0.72), 0, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const scale = 1 + eased * 0.035

        profiles.forEach((profile) => {
          profile.el.style.setProperty('--cutout-exit-x', `${profile.x * eased}px`)
          profile.el.style.setProperty('--cutout-exit-y', `${profile.y * eased}px`)
          profile.el.style.setProperty('--cutout-exit-rotate', `${profile.rotate * eased}deg`)
          profile.el.style.setProperty('--cutout-exit-scale', `${scale}`)
        })
      }

      const requestUpdate = () => {
        if (frame) return
        frame = requestAnimationFrame(updateExit)
      }

      const handleResize = () => {
        measureProfiles()
        requestUpdate()
      }

      measureProfiles()
      updateExit()
      window.addEventListener('scroll', requestUpdate, { passive: true })
      window.addEventListener('resize', handleResize)

      return () => {
        if (frame) cancelAnimationFrame(frame)
        window.removeEventListener('scroll', requestUpdate)
        window.removeEventListener('resize', handleResize)
        resetExitVars()
      }
    },
    { scope: heroRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  useEffect(() => {
    const images = homeExperiments.map((e) => e.mediaSrc).filter(Boolean)
    if (images.length) void preloadImages(images)
  }, [])

  useEffect(() => {
    const sectionId = HASH_SECTION_IDS[location.hash]
    if (!sectionId) return
    const el = document.getElementById(sectionId)
    if (!el) return
    const id = requestAnimationFrame(() => {
      const lenis = lenisService.instance
      lenis?.scrollTo(el, { offset: -96, duration: 1.1 })
    })
    return () => cancelAnimationFrame(id)
  }, [location.hash])

  useEffect(() => {
    if (!HERO_TUNER_ENABLED || !Object.keys(heroTune).length) return
    console.log('[hero-collage-tune]', currentHeroTune)
  }, [heroTune])

  return (
    <div ref={panelsRef} className="home-panels">
      <HomePanel
        id="hero"
        theme="hero"
        className="home-editorial-hero"
        hero
        aria-labelledby="hero-heading"
      >
        <div ref={heroRef} className="home-hero-editorial">
          <div className="home-hero-editorial__intro" data-home-reveal-content>
            <p className="home-hero-editorial__role" data-home-hero-animate>
              Principal Software Engineer
            </p>
            <h1 id="hero-heading" className="home-hero-editorial__title" data-home-hero-animate>
              {t('pages.home.heroName')}
            </h1>
            <p className="home-hero-editorial__statement" data-home-hero-animate>
              I craft resilient interfaces, product systems, and AI-assisted workflows with clarity
              and care.
            </p>
          </div>

          <div className="home-hero-editorial__collage" aria-hidden>
            {HERO_COLLAGE_ITEMS.map((item, index) => {
              const currentTune = heroTune[item.number] ?? item.tune
              const scaleDelta = currentTune.scale / item.tune.scale
              const floatProfile = getHeroFloatProfile(item.number, index)

              return (
                <article
                  key={item.id}
                  className={`home-hero-editorial__cutout home-hero-editorial__cutout--${item.shape} home-hero-editorial__cutout--group-${item.group} home-hero-editorial__cutout--${item.tone}`}
                  data-home-hero-animate
                  data-home-hero-float
                  data-float-x={floatProfile.x}
                  data-float-y={floatProfile.y}
                  data-float-cross-x={floatProfile.crossX}
                  data-float-cross-y={floatProfile.crossY}
                  data-float-duration={floatProfile.duration}
                  data-home-hero-scroll-exit
                  style={
                    {
                      '--cutout-index': index,
                      '--cutout-base-x': `${item.tune.x}px`,
                      '--cutout-base-y': `${item.tune.y}px`,
                      '--cutout-base-rotate': `${item.tune.rotate}deg`,
                      '--cutout-base-scale': item.tune.scale,
                      '--cutout-tune-x': `${currentTune.x - item.tune.x}px`,
                      '--cutout-tune-y': `${currentTune.y - item.tune.y}px`,
                      '--cutout-tune-rotate': `${currentTune.rotate - item.tune.rotate}deg`,
                      '--cutout-tune-scale': scaleDelta,
                    } as CSSProperties
                  }
                >
                  {HERO_TUNER_ENABLED ? (
                    <span className="home-hero-editorial__cutout-number">{item.number}</span>
                  ) : null}
                  <span className="home-hero-editorial__cutout-art">
                    <img
                      className="home-hero-editorial__cutout-image"
                      src={item.src}
                      alt=""
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                </article>
              )
            })}
          </div>
        </div>
      </HomePanel>

      {HERO_TUNER_ENABLED && !isHeroTunerOpen ? (
        <button
          type="button"
          className="home-hero-tuner-toggle"
          onClick={() => setIsHeroTunerOpen(true)}
        >
          Hero tuner
        </button>
      ) : null}

      {HERO_TUNER_ENABLED && isHeroTunerOpen ? (
        <aside className="home-hero-tuner" aria-label="Temporary hero collage tuner">
          <div className="home-hero-tuner__header">
            <div className="home-hero-tuner__title">
              <strong>Hero tuner</strong>
              <span>Every update logs values in DevTools.</span>
            </div>
            <div className="home-hero-tuner__header-actions">
              <button
                type="button"
                onClick={() => console.log('[hero-collage-tune]', currentHeroTune)}
              >
                Log
              </button>
              <button type="button" onClick={() => setIsHeroTunerOpen(false)}>
                Hide
              </button>
            </div>
          </div>

          <label className="home-hero-tuner__field">
            <span>Element</span>
            <select
              value={activeHeroTuneNumber}
              onChange={(event) => setActiveHeroTuneNumber(event.target.value)}
            >
              {HERO_COLLAGE_ITEMS.map((item) => (
                <option key={item.id} value={item.number}>
                  {item.number} - {item.id}
                </option>
              ))}
            </select>
          </label>

          <p className="home-hero-tuner__meta">
            {activeHeroTuneItem?.shape} / {activeHeroTuneItem?.group}
          </p>

          {(
            [
              ['x', 'X', -500, 500, 1],
              ['y', 'Y', -500, 500, 1],
              ['rotate', 'Rotate', -180, 180, 1],
              ['scale', 'Scale', 0.2, 2.5, 0.01],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <label key={key} className="home-hero-tuner__range">
              <span>{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={activeHeroTune[key]}
                onChange={(event) => updateHeroTune({ [key]: Number(event.target.value) })}
              />
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={activeHeroTune[key]}
                onChange={(event) => updateHeroTune({ [key]: Number(event.target.value) })}
              />
            </label>
          ))}

          <div className="home-hero-tuner__actions">
            <button type="button" onClick={resetHeroTuneItem}>
              Reset selected
            </button>
            <button type="button" onClick={() => setHeroTune({})}>
              Reset all
            </button>
          </div>

          <textarea
            readOnly
            aria-label="Current hero tuning JSON"
            value={JSON.stringify(currentHeroTune, null, 2)}
          />
        </aside>
      ) : null}

      <HomeExperimentsSection
        trackRef={experimentsTrackRef}
        stripRef={experimentsStripRef}
        scrubHorizontal={experimentsScrubHorizontal}
      />

      <HomePanel
        id="writings"
        theme="writings"
        className="home-listing"
        backgroundImage={HOME_SECTION_BANNERS.writings}
        aria-labelledby="writings-heading"
      >
        <HomeSlideLayout
          titleId="writings-heading"
          eyebrow="Field notes"
          title="Long-form notes from the edge of building"
          lead="Essays and technical sketches on engineering practice, creative tools, and the habits that make software feel considered."
        >
          <div className="home-listing__rows" role="list">
            {writings.slice(0, HOME_WRITINGS_PREVIEW_COUNT).map((item) => (
              <Link
                key={item.id}
                to={hrefWriting(item.id)}
                className="home-listing__row"
                data-home-reveal
                role="listitem"
              >
                <p className="home-listing__title">{item.title}</p>
                <p className="home-listing__date">{formatWritingDate(item.date)}</p>
                <span className="home-listing__tag">{item.category}</span>
              </Link>
            ))}
          </div>
          <Link className="home-listing__view-all" to={hrefWritings} data-home-reveal>
            {t('pages.writing.viewAllHome')}
          </Link>
        </HomeSlideLayout>
      </HomePanel>

      <HomePanel id="talks" theme="talks" className="home-listing" aria-labelledby="talks-heading">
        <HomeSlideLayout
          titleId="talks-heading"
          eyebrow="Speaking"
          title="Ideas made portable"
          lead="Talks and public notes shaped for teams, meetups, and builders who care about durable craft."
        >
          <div className="home-listing__rows" role="list">
            {talks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="home-listing__row"
                data-home-reveal
                role="listitem"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="home-listing__title">{item.title}</p>
                <p className="home-listing__date">{formatWritingDate(item.date)}</p>
                <span className="home-listing__tag">{item.tag}</span>
              </a>
            ))}
          </div>
        </HomeSlideLayout>
      </HomePanel>

      <HomeBookshelfSection
        books={bookshelf}
        trackRef={booksTrackRef}
        stripRef={booksStripRef}
        scrubHorizontal={booksScrubHorizontal}
      />
    </div>
  )
}
