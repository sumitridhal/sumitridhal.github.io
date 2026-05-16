import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { HeroAtmosphere } from '@/components/HeroAtmosphere'
import { HomeBookshelfSection } from '@/components/HomeBookshelfSection'
import { HomeExperimentsSection } from '@/components/HomeExperimentsSection'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HomeWorkSection } from '@/components/HomeWorkSection'
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

const HOME_WRITINGS_PREVIEW_COUNT = 4

const HASH_SECTION_IDS: Record<string, string> = {
  '#work': 'work',
  '#experiments': 'experiments',
  '#writings': 'writings',
  '#talks': 'talks',
  '#books': 'books',
}

export function HomePage() {
  const { t } = useI18n()
  const heroSectionRef = useRef<HTMLElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)
  const experimentsTrackRef = useRef<HTMLDivElement>(null)
  const experimentsStripRef = useRef<HTMLUListElement>(null)
  const workTrackRef = useRef<HTMLDivElement>(null)
  const workStripRef = useRef<HTMLUListElement>(null)
  const booksTrackRef = useRef<HTMLDivElement>(null)
  const booksStripRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const location = useLocation()
  const linkedHorizontalGallery = !reducedMotion && homeExperiments.length > 0

  useHomeStripScroll({
    rootRef: panelsRef,
    experimentsTrackRef,
    experimentsStripRef,
    workTrackRef,
    workStripRef,
    booksTrackRef,
    booksStripRef,
    enabled: linkedHorizontalGallery,
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
      <section
        ref={heroSectionRef}
        id="hero"
        data-home-panel
        data-home-theme="hero"
        className={`home-section home-section--hero zoom-hero zoom-hero--kinetic${reducedMotion ? ' zoom-hero--reduced' : ''}`}
        aria-labelledby="hero-heading"
      >
        <div className="home-section__inner zoom-hero__shell">
          <div className="zoom-hero__panel-bg">
            <HeroAtmosphere sectionRef={heroSectionRef} reducedMotion={reducedMotion}>
              <h1 id="hero-heading" className="zoom-hero__heading-sr-only">
                Sumit Ridhal
              </h1>
            </HeroAtmosphere>
            <div className="zoom-hero__veil" aria-hidden />
          </div>
        </div>
      </section>

      <HomeExperimentsSection
        trackRef={experimentsTrackRef}
        stripRef={experimentsStripRef}
        scrubHorizontal={linkedHorizontalGallery}
      />

      <HomePanel id="work" theme="work" className="work-panel" aria-labelledby="work-heading">
        <HomeWorkSection
          trackRef={workTrackRef}
          stripRef={workStripRef}
          scrubHorizontal={linkedHorizontalGallery}
        />
      </HomePanel>

      <HomePanel
        id="writings"
        theme="writings"
        className="home-listing"
        backgroundImage={HOME_SECTION_BANNERS.writings}
        aria-labelledby="writings-heading"
      >
        <HomeSlideLayout titleId="writings-heading" title="Writings">
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
        <HomeSlideLayout titleId="talks-heading" title="Talks">
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
        scrubHorizontal={linkedHorizontalGallery}
      />
    </div>
  )
}
