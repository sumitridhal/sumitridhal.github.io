import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { writings, writingTitle } from '@/data/writingsData'
import { hrefHome, hrefWriting } from '@/i18n/routes'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function WritingsGalleryPage() {
  const { locale, t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const targets = root.querySelectorAll<HTMLElement>('.writings-gallery__anim')
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
            stagger: 0.06,
            ease: 'power2.out',
          })
        })
      },
      { root: null, threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    )

    io.observe(root)

    return () => {
      io.disconnect()
      gsap.killTweensOf(targets)
    }
  }, [locale, reducedMotion])

  return (
    <div ref={rootRef} className="writings-gallery">
      <div className="writings-gallery__inner">
        <header className="writings-gallery__header">
          <p className="writings-gallery__kicker writings-gallery__anim">
            {t('pages.writing.galleryCategory')}
          </p>
          <h1 className="writings-gallery__intro writings-gallery__anim">
            {t('pages.writing.galleryHeroLead')}
          </h1>
        </header>

        {writings.length === 0 ? (
          <p className="writings-gallery__empty writings-gallery__anim">
            {t('pages.footer.emptyWritings')}
          </p>
        ) : (
          <ul className="writings-gallery__list">
            {writings.map((item) => (
              <li key={item.id} className="writings-gallery__item writings-gallery__anim">
                <Link
                  to={hrefWriting(locale, item.id)}
                  className="writings-gallery__row"
                >
                  <span className="writings-gallery__row-title">
                    {writingTitle(item, locale)}
                  </span>
                  <span className="writings-gallery__row-meta">{item.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="writings-gallery__footer writings-gallery__anim">
          <Link className="writings-gallery__footer-link" to={{ pathname: hrefHome(locale), hash: 'writings' }}>
            {t('pages.writing.galleryListLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
