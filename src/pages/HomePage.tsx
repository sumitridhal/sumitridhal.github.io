import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { HomeBookshelfSection } from '@/components/HomeBookshelfSection'
import { HomeExperimentsSection } from '@/components/HomeExperimentsSection'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HomeWorkSection } from '@/components/HomeWorkSection'
import { useI18n } from '@/contexts/I18nContext'
import { bookshelf } from '@/data/bookshelfData'
import { homeExperiments } from '@/data/experimentsData'
import { projects } from '@/data/projectsData'
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

const HERO_FOCUS_AREAS = [
  'Design systems',
  'Resilient interfaces',
  'AI-assisted workflows',
] as const

gsap.registerPlugin(useGSAP)

const HASH_SECTION_IDS: Record<string, string> = {
  '#work': 'work',
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
  const heroStats = [
    { value: `${projects.length}`, label: t('pages.home.heroStats.projects') },
    { value: `${homeExperiments.length}`, label: t('pages.home.heroStats.experiments') },
    { value: `${writings.length}`, label: t('pages.home.heroStats.writings') },
  ]

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
          <div className="home-hero-editorial__masthead" data-home-reveal-content>
            <p className="home-hero-editorial__kicker" data-home-hero-animate>
              {t('pages.home.heroKicker')}
            </p>
            <h1 id="hero-heading" className="home-hero-editorial__title">
              <span data-home-hero-animate>{t('pages.home.heroName')}</span>
              <span data-home-hero-animate>{t('pages.home.heroTitleLine')}</span>
            </h1>
            <p className="home-hero-editorial__lead" data-home-hero-animate>
              {t('pages.home.heroLead')}
            </p>
            <div className="home-hero-editorial__actions" aria-label={t('pages.home.heroActionsAria')}>
              <Link
                className="home-hero-editorial__button home-hero-editorial__button--primary"
                to="/#work"
                data-home-hero-animate
              >
                {t('pages.home.heroPrimaryCta')}
              </Link>
              <Link className="home-hero-editorial__button" to={hrefWritings} data-home-hero-animate>
                {t('pages.home.heroSecondaryCta')}
              </Link>
            </div>
          </div>

          <aside className="home-hero-editorial__folio" aria-label={t('pages.home.heroFolioAria')}>
            <div
              className="home-hero-editorial__folio-card"
              data-home-reveal
              data-home-hero-animate
              data-home-focus-card
            >
              <p className="home-hero-editorial__folio-label">{t('pages.home.heroFocusLabel')}</p>
              <ul className="home-hero-editorial__focus-list" role="list">
                {HERO_FOCUS_AREAS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="home-hero-editorial__stats" data-home-reveal data-home-hero-animate>
              {heroStats.map((item) => (
                <div key={item.label} className="home-hero-editorial__stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </HomePanel>

      <HomeExperimentsSection
        trackRef={experimentsTrackRef}
        stripRef={experimentsStripRef}
        scrubHorizontal={experimentsScrubHorizontal}
      />

      <HomePanel id="work" theme="work" className="work-panel" aria-labelledby="work-heading">
        <HomeWorkSection />
      </HomePanel>

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
