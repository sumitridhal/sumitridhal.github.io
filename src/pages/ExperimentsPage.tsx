import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import {
  experimentKinds,
  experimentsForKind,
  type ExperimentKind,
} from '@/data/experimentsData'
import { hrefHome } from '@/i18n/routes'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { lenisService } from '@/services/lenisService'

function kindHeadingKey(kind: ExperimentKind): string {
  if (kind === 'gsap') return 'pages.experiments.kindGsapHeading'
  if (kind === 'three') return 'pages.experiments.kindThreeHeading'
  return 'pages.experiments.kindShaderHeading'
}

export function ExperimentsPage() {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      const lenis = lenisService.instance
      if (lenis) {
        lenis.scrollTo(el, { offset: -96, duration: 0.85 })
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const targets = root.querySelectorAll<HTMLElement>('.experiments-page__anim')
    if (targets.length === 0) return

    const prefersReduced =
      reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      targets.forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      return
    }

    gsap.set(targets, { opacity: 0, y: 20 })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          io.disconnect()
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.05,
            ease: 'power2.out',
          })
        })
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    io.observe(root)

    return () => {
      io.disconnect()
      gsap.killTweensOf(targets)
    }
  }, [reducedMotion])

  return (
    <div ref={rootRef} className="experiments-page">
      <div className="experiments-page__inner">
        <header className="experiments-page__header">
          <p className="experiments-page__kicker experiments-page__anim">
            {t('pages.experiments.galleryCategory')}
          </p>
          <h1 className="experiments-page__intro experiments-page__anim">
            {t('pages.experiments.galleryHeroLead')}
          </h1>
        </header>

        {experimentKinds.map((kind) => (
          <section
            key={kind}
            id={kind}
            className="experiments-page__block"
            aria-labelledby={`experiments-heading-${kind}`}
          >
            <h2 id={`experiments-heading-${kind}`} className="experiments-page__block-heading">
              {t(kindHeadingKey(kind))}
            </h2>
            <ul className="experiments-page__grid">
              {experimentsForKind(kind).map((item) => (
                <li key={item.id} className="experiments-page__card experiments-page__anim">
                  <article className="experiments-page__card-inner">
                    <div className="experiments-page__card-media">
                      <img src={item.coverSrc} alt="" loading="lazy" />
                    </div>
                    <h3 className="experiments-page__card-title">{item.title}</h3>
                    <p className="experiments-page__card-blurb">{item.blurb}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="experiments-page__footer experiments-page__anim">
          <Link className="experiments-page__footer-link" to={{ pathname: hrefHome, hash: 'experiments' }}>
            {t('pages.experiments.galleryListLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
