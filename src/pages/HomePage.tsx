import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import LocomotiveScroll from 'locomotive-scroll'
import { Link, useLocation } from 'react-router-dom'
import 'locomotive-scroll/dist/locomotive-scroll.css'

import { HeroAtmosphere } from '@/components/HeroAtmosphere'
import { useI18n } from '@/contexts/I18nContext'
import { projects } from '@/data/projectsData'
import { writings } from '@/data/writingsData'
import {
  hrefAbout,
  hrefWork,
  hrefWriting,
  type Locale,
} from '@/i18n/routes'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLenis } from '@/providers/LenisProvider'
import { lenisService } from '@/services/lenisService'
import { preloadImages } from '@/utils/imagePreloadCache'

type BookItem = {
  id: string
  title: Record<Locale, string>
  author: Record<Locale, string>
  spineColor: string
  textColor: string
  /** Representative print page count — drives spine thickness. */
  pages: number
  coverSrc?: string
}

/** Linear map from page count to spine width (thin books narrower, bricks wider). */
function spineWidthFromPages(pages: number): string {
  const minPages = 80
  const maxPages = 1200
  const minW = 50
  const maxW = 100
  const clamped = Math.min(maxPages, Math.max(minPages, pages))
  const t = (clamped - minPages) / (maxPages - minPages)
  return `${Math.round(minW + t * (maxW - minW))}px`
}

const bookshelf: BookItem[] = [
  {
    id: 'construction-of-social-reality',
    title: {
      en: 'The Construction of Social Reality',
      de: 'Die Konstruktion der sozialen Realitaet',
      fr: 'La construction de la realite sociale',
      hi: 'The Construction of Social Reality',
    },
    author: { en: 'John R. Searle', de: 'John R. Searle', fr: 'John R. Searle', hi: 'John R. Searle' },
    spineColor: '#02061f',
    textColor: '#f0f4fb',
    pages: 256,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780684831794-M.jpg',
  },
  {
    id: 'design-of-everyday-things',
    title: { en: 'The Design of Everyday Things', de: 'The Design of Everyday Things', fr: 'The Design of Everyday Things', hi: 'The Design of Everyday Things' },
    author: { en: 'Don Norman', de: 'Don Norman', fr: 'Don Norman', hi: 'Don Norman' },
    spineColor: '#f0de2f',
    textColor: '#141414',
    pages: 368,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780465050659-M.jpg',
  },
  {
    id: 'boxing-a-cultural-history',
    title: { en: 'Boxing: A Cultural History', de: 'Boxing: A Cultural History', fr: 'Boxing: A Cultural History', hi: 'Boxing: A Cultural History' },
    author: { en: 'Kasia Boddy', de: 'Kasia Boddy', fr: 'Kasia Boddy', hi: 'Kasia Boddy' },
    spineColor: '#a72c31',
    textColor: '#f5f6f8',
    pages: 480,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9781861893697-M.jpg',
  },
  {
    id: 'dying-for-ideas',
    title: { en: 'Dying for Ideas', de: 'Dying for Ideas', fr: 'Dying for Ideas', hi: 'Dying for Ideas' },
    author: { en: 'Costica Bradatan', de: 'Costica Bradatan', fr: 'Costica Bradatan', hi: 'Costica Bradatan' },
    spineColor: '#3d2528',
    textColor: '#f4ebe0',
    pages: 256,
    coverSrc:
      'https://books.google.com/books/content?id=jOxJBgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'against-the-machine',
    title: { en: 'Against the Machine', de: 'Against the Machine', fr: 'Against the Machine', hi: 'Against the Machine' },
    author: { en: 'Paul Kingsnorth', de: 'Paul Kingsnorth', fr: 'Paul Kingsnorth', hi: 'Paul Kingsnorth' },
    spineColor: '#1f5d2d',
    textColor: '#f0f7ef',
    pages: 368,
    coverSrc:
      'https://books.google.com/books/content?id=dbod0QEACAAJ&printsec=frontcover&img=1&zoom=2&edge=nocurl&source=gbs_api',
  },
  {
    id: 'cultural-ideologies-romania',
    title: {
      en: 'Ideologies in Contemporary Romania',
      de: 'Ideologies in Contemporary Romania',
      fr: 'Ideologies in Contemporary Romania',
      hi: 'Ideologies in Contemporary Romania',
    },
    author: { en: 'Claude Karnoouh', de: 'Claude Karnoouh', fr: 'Claude Karnoouh', hi: 'Claude Karnoouh' },
    spineColor: '#dde0e3',
    textColor: '#2b3039',
    pages: 304,
  },
  {
    id: 'rupa-eu-blestemul',
    title: { en: 'Rupea blestemului', de: 'Rupea blestemului', fr: 'Rupea blestemului', hi: 'Rupea blestemului' },
    author: { en: 'Catalin Pavel', de: 'Catalin Pavel', fr: 'Catalin Pavel', hi: 'Catalin Pavel' },
    spineColor: '#c4174a',
    textColor: '#fbf2f5',
    pages: 288,
  },
  {
    id: 'simple-genius',
    title: { en: 'Simple Genius', de: 'Simple Genius', fr: 'Simple Genius', hi: 'Simple Genius' },
    author: { en: 'David Baldacci', de: 'David Baldacci', fr: 'David Baldacci', hi: 'David Baldacci' },
    spineColor: '#eceeef',
    textColor: '#121722',
    pages: 420,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780446581738-M.jpg',
  },
  {
    id: 'drumul-catre-servitute',
    title: { en: 'Drumul catre servitute', de: 'Drumul catre servitute', fr: 'Drumul catre servitute', hi: 'Drumul catre servitute' },
    author: { en: 'Friedrich A. Hayek', de: 'Friedrich A. Hayek', fr: 'Friedrich A. Hayek', hi: 'Friedrich A. Hayek' },
    spineColor: '#22234e',
    textColor: '#eef2ff',
    pages: 316,
    coverSrc: 'https://covers.openlibrary.org/b/id/14847910-M.jpg',
  },
  {
    id: 'atlas-shrugged',
    title: { en: 'Atlas Shrugged', de: 'Atlas Shrugged', fr: 'Atlas Shrugged', hi: 'Atlas Shrugged' },
    author: { en: 'Ayn Rand', de: 'Ayn Rand', fr: 'Ayn Rand', hi: 'Ayn Rand' },
    spineColor: '#f4f4f5',
    textColor: '#1d2126',
    pages: 1184,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0679417397-M.jpg',
  },
  {
    id: 'the-black-swan',
    title: { en: 'The Black Swan', de: 'The Black Swan', fr: 'The Black Swan', hi: 'The Black Swan' },
    author: { en: 'Nassim Nicholas Taleb', de: 'Nassim Nicholas Taleb', fr: 'Nassim Nicholas Taleb', hi: 'Nassim Nicholas Taleb' },
    spineColor: '#171717',
    textColor: '#f5f5f5',
    pages: 423,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0452284236-M.jpg',
  },
  {
    id: 'meditations',
    title: { en: 'Meditations', de: 'Meditations', fr: 'Meditations', hi: 'Meditations' },
    author: { en: 'Marcus Aurelius', de: 'Marcus Aurelius', fr: 'Marcus Aurelius', hi: 'Marcus Aurelius' },
    spineColor: '#4f3b2b',
    textColor: '#f9f2e8',
    pages: 273,
    coverSrc:
      'https://books.google.com/books/content?id=brSidvTKfcQC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'manufacturing-consent',
    title: { en: 'Manufacturing Consent', de: 'Manufacturing Consent', fr: 'Manufacturing Consent', hi: 'Manufacturing Consent' },
    author: { en: 'Noam Chomsky', de: 'Noam Chomsky', fr: 'Noam Chomsky', hi: 'Noam Chomsky' },
    spineColor: '#7b1e1f',
    textColor: '#fff6f4',
    pages: 412,
    coverSrc: 'https://covers.openlibrary.org/b/id/7900362-M.jpg',
  },
  {
    id: 'the-society-of-the-spectacle',
    title: { en: 'The Society of the Spectacle', de: 'The Society of the Spectacle', fr: 'The Society of the Spectacle', hi: 'The Society of the Spectacle' },
    author: { en: 'Guy Debord', de: 'Guy Debord', fr: 'Guy Debord', hi: 'Guy Debord' },
    spineColor: '#2f3a56',
    textColor: '#eff3ff',
    pages: 192,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0934868077-M.jpg',
  },
  {
    id: 'the-brothers-karamazov',
    title: { en: 'The Brothers Karamazov', de: 'The Brothers Karamazov', fr: 'The Brothers Karamazov', hi: 'The Brothers Karamazov' },
    author: { en: 'Fyodor Dostoevsky', de: 'Fyodor Dostoevsky', fr: 'Fyodor Dostoevsky', hi: 'Fyodor Dostoevsky' },
    spineColor: '#1f2a29',
    textColor: '#eaf7f5',
    pages: 856,
    coverSrc:
      'https://books.google.com/books/content?id=VhfYK9jgYAYC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'capitalist-realism',
    title: { en: 'Capitalist Realism', de: 'Capitalist Realism', fr: 'Capitalist Realism', hi: 'Capitalist Realism' },
    author: { en: 'Mark Fisher', de: 'Mark Fisher', fr: 'Mark Fisher', hi: 'Mark Fisher' },
    spineColor: '#313131',
    textColor: '#f2f2f2',
    pages: 88,
    coverSrc:
      'https://books.google.com/books/content?id=QSiUEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'letters-to-a-young-poet',
    title: { en: 'Letters to a Young Poet', de: 'Letters to a Young Poet', fr: 'Letters to a Young Poet', hi: 'Letters to a Young Poet' },
    author: { en: 'Rainer Maria Rilke', de: 'Rainer Maria Rilke', fr: 'Rainer Maria Rilke', hi: 'Rainer Maria Rilke' },
    spineColor: '#6e4a68',
    textColor: '#f7ecf6',
    pages: 104,
    coverSrc:
      'https://books.google.com/books/content?id=lwHgAgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'critique-of-pure-reason',
    title: { en: 'Critique of Pure Reason', de: 'Critique of Pure Reason', fr: 'Critique of Pure Reason', hi: 'Critique of Pure Reason' },
    author: { en: 'Immanuel Kant', de: 'Immanuel Kant', fr: 'Immanuel Kant', hi: 'Immanuel Kant' },
    spineColor: '#27374d',
    textColor: '#f2f6fb',
    pages: 798,
    coverSrc: 'https://openroadmedia.com/ebook/the-critique-of-pure-reason/9781504004626',
  },
  {
    id: 'the-stranger',
    title: {
      en: 'The Stranger',
      de: "L'Etranger",
      fr: "L'Etranger",
      hi: 'The Stranger',
    },
    author: { en: 'Albert Camus', de: 'Albert Camus', fr: 'Albert Camus', hi: 'Albert Camus' },
    spineColor: '#b73a2f',
    textColor: '#fff8ea',
    pages: 159,
    coverSrc:
      'https://upload.wikimedia.org/wikipedia/commons/9/97/L%27%C3%89tranger_-_Albert_Camus.jpg',
  },
  {
    id: 'anna-karenina',
    title: { en: 'Anna Karenina', de: 'Анна Каренина', fr: 'Anna Karenina', hi: 'Anna Karenina' },
    author: { en: 'Leo Tolstoy', de: 'Leo Tolstoy', fr: 'Leo Tolstoy', hi: 'Leo Tolstoy' },
    spineColor: '#2d3a2f',
    textColor: '#edf3ea',
    pages: 864,
    coverSrc: 'https://prodimage.images-bn.com/pimages/9780140449174_p0_v2_s600x595.jpg',
  },
]

export function HomePage() {
  const { locale, t } = useI18n()
  const heroSectionRef = useRef<HTMLElement>(null)
  const reducedHero = usePrefersReducedMotion()
  const location = useLocation()
  const lenis = useLenis()
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 })
  const booksViewportRef = useRef<HTMLDivElement | null>(null)
  const booksTrackRef = useRef<HTMLDivElement | null>(null)
  const books = bookshelf

  useEffect(() => {
    void preloadImages(projects.map((p) => p.coverSrc))
  }, [])

  useEffect(() => {
    const hash = location.hash
    const sectionId = hash === '#work' ? 'work' : hash === '#writings' ? 'writings' : null
    if (!sectionId) return
    const el = document.getElementById(sectionId)
    if (!el) return
    const id = requestAnimationFrame(() => {
      const lenis = lenisService.instance
      lenis?.scrollTo(el, { offset: -96, duration: 1.1 })
    })
    return () => cancelAnimationFrame(id)
  }, [location.hash])

  const handleWorkMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!activeWorkId) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5
    setPreviewOffset({
      x: normalizedX * 18,
      y: normalizedY * 14,
    })
  }

  const handleWorkMouseLeave = () => {
    setActiveWorkId(null)
    setPreviewOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const viewport = booksViewportRef.current
    const track = booksTrackRef.current
    if (!viewport || !track) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const scroll = new LocomotiveScroll({
      lenisOptions: {
        wrapper: viewport,
        content: track,
        orientation: 'horizontal',
        gestureOrientation: 'both',
        smoothWheel: true,
        wheelMultiplier: 0.75,
        lerp: 0.08,
      },
    })

    const horizontalLenis = scroll.lenisInstance
    const pausePageScroll = () => lenis?.stop()
    const resumePageScroll = () => lenis?.start()
    const onWheel = (event: WheelEvent) => event.stopPropagation()
    const onKeyDown = (event: KeyboardEvent) => {
      if (!horizontalLenis) return
      const step = Math.max(180, viewport.clientWidth * 0.45)
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        horizontalLenis.scrollTo(horizontalLenis.scroll + step, {
          duration: 0.9,
        })
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        horizontalLenis.scrollTo(horizontalLenis.scroll - step, {
          duration: 0.9,
        })
      }
    }

    const resizeObserver = new ResizeObserver(() => scroll.resize())
    resizeObserver.observe(track)
    viewport.addEventListener('wheel', onWheel, { passive: true })
    viewport.addEventListener('keydown', onKeyDown)
    viewport.addEventListener('mouseenter', pausePageScroll)
    viewport.addEventListener('mouseleave', resumePageScroll)
    viewport.addEventListener('focusin', pausePageScroll)
    viewport.addEventListener('focusout', resumePageScroll)

    return () => {
      resizeObserver.disconnect()
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('keydown', onKeyDown)
      viewport.removeEventListener('mouseenter', pausePageScroll)
      viewport.removeEventListener('mouseleave', resumePageScroll)
      viewport.removeEventListener('focusin', pausePageScroll)
      viewport.removeEventListener('focusout', resumePageScroll)
      scroll.destroy()
      lenis?.start()
    }
  }, [lenis])

  return (
    <>
      <section
        ref={heroSectionRef}
        id="hero"
        className={`zoom-hero zoom-hero--kinetic${reducedHero ? ' zoom-hero--reduced' : ''}`}
        aria-labelledby="hero-heading"
      >
        <HeroAtmosphere
          key={locale}
          sectionRef={heroSectionRef}
          reducedMotion={reducedHero}
        >
          <h1 id="hero-heading" className="zoom-hero__heading-sr-only">
            Sumit Ridhal
          </h1>
        </HeroAtmosphere>

        <div className="zoom-hero__veil" aria-hidden />
      </section>

      <section id="work" className="work">
        <h2 className="work__heading">Selected projects</h2>
        <div className="work__layout">
          <div
            className="work__list"
            role="list"
            onMouseMove={handleWorkMouseMove}
            onMouseLeave={handleWorkMouseLeave}
          >
            {projects.map((project) => {
              const slug = project.slug[locale]
              const isActive = activeWorkId === project.id

              return (
                <Link
                  key={project.id}
                  to={hrefWork(locale, slug)}
                  className={`work__row${isActive ? ' work__row--active' : ''}`}
                  role="listitem"
                  onMouseEnter={() => setActiveWorkId(project.id)}
                  onFocus={() => setActiveWorkId(project.id)}
                >
                  <h3 className="work__title">{project.title[locale]}</h3>
                  <p className="work__meta">{project.tagline[locale]}</p>
                </Link>
              )
            })}
          </div>
          <aside
            className={`work__preview${activeWorkId ? ' work__preview--visible' : ''}`}
            aria-hidden="true"
            style={
              {
                '--preview-x': `${previewOffset.x}px`,
                '--preview-y': `${previewOffset.y}px`,
              } as CSSProperties
            }
          >
            {projects.map((project) => (
              <img
                key={project.id}
                src={project.coverSrc}
                alt=""
                className={`work__preview-image${activeWorkId === project.id ? ' work__preview-image--active' : ''}`}
              />
            ))}
          </aside>
        </div>
      </section>

      <section id="writings" className="home-listing">
        <h2 className="home-listing__heading">Writings</h2>
        <div className="home-listing__rows" role="list">
          {writings.map((item) => (
            <Link
              key={item.id}
              to={hrefWriting(locale, item.id)}
              className="home-listing__row"
              role="listitem"
            >
              <p className="home-listing__title">{item.title}</p>
              <p className="home-listing__date">{item.date}</p>
              <span className="home-listing__tag">{item.category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="books" className="bookshelf">
        <h2 className="bookshelf__heading">Bookshelf</h2>
        <div className="bookshelf__viewport" ref={booksViewportRef} tabIndex={0}>
          <div className="bookshelf__track" ref={booksTrackRef} role="list">
            {books.map((book) => (
              <article
                key={book.id}
                className="bookshelf__book"
                role="listitem"
                aria-label={`${book.title[locale]}, ${book.author[locale]}, ${book.pages} pages`}
                style={
                  {
                    '--book-width': spineWidthFromPages(book.pages),
                    '--book-spine-color': book.spineColor,
                    '--book-text-color': book.textColor,
                  } as CSSProperties
                }
              >
                <span className="bookshelf__badge" aria-hidden="true">
                  {book.author[locale]}
                </span>
                <div className="bookshelf__spine">
                  <p className="bookshelf__title">{book.title[locale]}</p>
                  <p className="bookshelf__author">{book.author[locale]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-teaser" className="home-about-teaser">
        <h2 className="home-about-teaser__title">{t('pages.home.aboutHeading')}</h2>
        <p className="home-about-teaser__lead">{t('pages.home.aboutLead')}</p>
        <Link className="home-about-teaser__link" to={hrefAbout(locale)}>
          {t('nav.about')}
        </Link>
      </section>
    </>
  )
}
