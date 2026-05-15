import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { HeroAtmosphere } from '@/components/HeroAtmosphere'
import { HomeBookshelfSection } from '@/components/HomeBookshelfSection'
import { HomeExperimentsSection } from '@/components/HomeExperimentsSection'
import { HOME_BANNER_URLS, HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'
import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HomeWorkSection } from '@/components/HomeWorkSection'
import { useI18n } from '@/contexts/I18nContext'
import { homeExperiments } from '@/data/experimentsData'
import { talks } from '@/data/talksData'
import { writings } from '@/data/writingsData'
import { useHomePanelReveal } from '@/hooks/useHomePanelReveal'
import { useHomePanelTheme } from '@/hooks/useHomePanelTheme'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hrefWriting, hrefWritings } from '@/i18n/routes'
import { lenisService } from '@/services/lenisService'
import { formatWritingDate } from '@/utils/formatWritingDate'
import { preloadImages } from '@/utils/imagePreloadCache'

const HOME_WRITINGS_PREVIEW_COUNT = 4

type BookItem = {
  id: string
  title: string
  author: string
  spineColor: string
  textColor: string
  pages: number
  coverSrc?: string
}

const bookshelf: BookItem[] = [
  {
    id: 'construction-of-social-reality',
    title: 'The Construction of Social Reality',
    author: 'John R. Searle',
    spineColor: '#02061f',
    textColor: '#f0f4fb',
    pages: 256,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780684831794-M.jpg',
  },
  {
    id: 'design-of-everyday-things',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    spineColor: '#f0de2f',
    textColor: '#141414',
    pages: 368,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780465050659-M.jpg',
  },
  {
    id: 'boxing-a-cultural-history',
    title: 'Boxing: A Cultural History',
    author: 'Kasia Boddy',
    spineColor: '#a72c31',
    textColor: '#f5f6f8',
    pages: 480,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9781861893697-M.jpg',
  },
  {
    id: 'dying-for-ideas',
    title: 'Dying for Ideas',
    author: 'Costica Bradatan',
    spineColor: '#3d2528',
    textColor: '#f4ebe0',
    pages: 256,
    coverSrc:
      'https://books.google.com/books/content?id=jOxJBgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'against-the-machine',
    title: 'Against the Machine',
    author: 'Paul Kingsnorth',
    spineColor: '#1f5d2d',
    textColor: '#f0f7ef',
    pages: 368,
    coverSrc:
      'https://books.google.com/books/content?id=dbod0QEACAAJ&printsec=frontcover&img=1&zoom=2&edge=nocurl&source=gbs_api',
  },
  {
    id: 'cultural-ideologies-romania',
    title: 'Ideologies in Contemporary Romania',
    author: 'Claude Karnoouh',
    spineColor: '#dde0e3',
    textColor: '#2b3039',
    pages: 304,
  },
  {
    id: 'rupa-eu-blestemul',
    title: 'Rupea blestemului',
    author: 'Catalin Pavel',
    spineColor: '#c4174a',
    textColor: '#fbf2f5',
    pages: 288,
  },
  {
    id: 'simple-genius',
    title: 'Simple Genius',
    author: 'David Baldacci',
    spineColor: '#eceeef',
    textColor: '#121722',
    pages: 420,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780446581738-M.jpg',
  },
  {
    id: 'drumul-catre-servitute',
    title: 'Drumul catre servitute',
    author: 'Friedrich A. Hayek',
    spineColor: '#22234e',
    textColor: '#eef2ff',
    pages: 316,
    coverSrc: 'https://covers.openlibrary.org/b/id/14847910-M.jpg',
  },
  {
    id: 'atlas-shrugged',
    title: 'Atlas Shrugged',
    author: 'Ayn Rand',
    spineColor: '#f4f4f5',
    textColor: '#1d2126',
    pages: 1184,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0679417397-M.jpg',
  },
  {
    id: 'the-black-swan',
    title: 'The Black Swan',
    author: 'Nassim Nicholas Taleb',
    spineColor: '#171717',
    textColor: '#f5f5f5',
    pages: 423,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0452284236-M.jpg',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    spineColor: '#4f3b2b',
    textColor: '#f9f2e8',
    pages: 273,
    coverSrc:
      'https://books.google.com/books/content?id=brSidvTKfcQC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'manufacturing-consent',
    title: 'Manufacturing Consent',
    author: 'Noam Chomsky',
    spineColor: '#7b1e1f',
    textColor: '#fff6f4',
    pages: 412,
    coverSrc: 'https://covers.openlibrary.org/b/id/7900362-M.jpg',
  },
  {
    id: 'the-society-of-the-spectacle',
    title: 'The Society of the Spectacle',
    author: 'Guy Debord',
    spineColor: '#2f3a56',
    textColor: '#eff3ff',
    pages: 192,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0934868077-M.jpg',
  },
  {
    id: 'the-brothers-karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    spineColor: '#1f2a29',
    textColor: '#eaf7f5',
    pages: 856,
    coverSrc:
      'https://books.google.com/books/content?id=VhfYK9jgYAYC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'capitalist-realism',
    title: 'Capitalist Realism',
    author: 'Mark Fisher',
    spineColor: '#313131',
    textColor: '#f2f2f2',
    pages: 88,
    coverSrc:
      'https://books.google.com/books/content?id=QSiUEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'letters-to-a-young-poet',
    title: 'Letters to a Young Poet',
    author: 'Rainer Maria Rilke',
    spineColor: '#6e4a68',
    textColor: '#f7ecf6',
    pages: 104,
    coverSrc:
      'https://books.google.com/books/content?id=lwHgAgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'critique-of-pure-reason',
    title: 'Critique of Pure Reason',
    author: 'Immanuel Kant',
    spineColor: '#27374d',
    textColor: '#f2f6fb',
    pages: 798,
    coverSrc: 'https://openroadmedia.com/ebook/the-critique-of-pure-reason/9781504004626',
  },
  {
    id: 'the-stranger',
    title: 'The Stranger',
    author: 'Albert Camus',
    spineColor: '#b73a2f',
    textColor: '#fff8ea',
    pages: 159,
    coverSrc:
      'https://upload.wikimedia.org/wikipedia/commons/9/97/L%27%C3%89tranger_-_Albert_Camus.jpg',
  },
  {
    id: 'anna-karenina',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    spineColor: '#2d3a2f',
    textColor: '#edf3ea',
    pages: 864,
    coverSrc: 'https://prodimage.images-bn.com/pimages/9780140449174_p0_v2_s600x595.jpg',
  },
]

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
  const reducedMotion = usePrefersReducedMotion()
  const location = useLocation()

  useHomePanelTheme({
    rootRef: panelsRef,
    reducedMotion,
  })

  useHomePanelReveal({
    rootRef: panelsRef,
    reducedMotion,
  })

  useEffect(() => {
    const images = [
      ...homeExperiments.map((e) => e.mediaSrc).filter(Boolean),
      ...HOME_BANNER_URLS,
    ]
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

      <HomeExperimentsSection />

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

      <HomeBookshelfSection books={bookshelf} />
    </div>
  )
}
