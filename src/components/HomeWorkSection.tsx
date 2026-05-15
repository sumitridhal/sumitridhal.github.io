import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { projects } from '@/data/projectsData'
import { hrefWork } from '@/i18n/routes'
import { preloadImages } from '@/utils/imagePreloadCache'

export function HomeWorkSection() {
  const [active, setActive] = useState<number | null>(null)
  const activeRef = useRef<number | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)

  const writeDom = useCallback((index: number) => {
    const img = imgRef.current
    const cap = captionRef.current
    const row = projects[index]
    if (!img || !cap || !row) return
    img.alt = row.title
    img.src = row.coverSrc
    cap.textContent = row.tagline
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(projects.length - 1, index))
      if (activeRef.current === i) return
      activeRef.current = i
      setActive(i)
      writeDom(i)
    },
    [writeDom],
  )

  useEffect(() => {
    void preloadImages(projects.map((p) => p.coverSrc))
  }, [])

  const first = projects[0]!

  return (
    <HomeSlideLayout
      titleId="work-heading"
      title="Selected projects"
      media={
        <div className="work__media-frame">
          <img
            ref={imgRef}
            className="work__media-image"
            src={first.coverSrc}
            alt={first.title}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      }
    >
      <div className="work" aria-labelledby="work-heading">
        <ul className="work__list" aria-label="Selected projects">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={`work__item${active === i ? ' is-active' : ''}`}
              data-home-reveal
              onPointerEnter={() => goTo(i)}
            >
              <Link
                to={hrefWork(project.slug)}
                className="work__link"
                onFocus={() => goTo(i)}
                aria-current={active === i ? 'true' : undefined}
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>

        {active === null ? (
          <p className="work__idle-hint" data-home-reveal>
            Hover or focus a line to open the preview.
          </p>
        ) : null}

        <div className={`work__caption-dock${active === null ? ' is-idle' : ''}`} data-home-reveal>
          <p ref={captionRef} className="work__dock-caption">
            {first.tagline}
          </p>
        </div>
      </div>
    </HomeSlideLayout>
  )
}
