import { useEffect, type RefObject } from 'react'
import { Link } from 'react-router-dom'

import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { projects } from '@/data/projectsData'
import { hrefWork } from '@/i18n/routes'
import { preloadImages } from '@/utils/imagePreloadCache'

export type HomeWorkSectionProps = {
  trackRef?: RefObject<HTMLDivElement | null>
  stripRef?: RefObject<HTMLUListElement | null>
  scrubHorizontal?: boolean
}

export function HomeWorkSection({
  trackRef,
  stripRef,
  scrubHorizontal = false,
}: HomeWorkSectionProps) {
  useEffect(() => {
    void preloadImages(projects.map((p) => p.coverSrc))
  }, [])

  const nativeHorizontalScroll = !scrubHorizontal

  return (
    <HomeSlideLayout titleId="work-heading" title="Selected projects" className="work-slide">
      <div className="work" aria-labelledby="work-heading">
        <div ref={trackRef} className={`work__track${scrubHorizontal ? ' work__track--scrub' : ''}`}>
          <ul
            ref={stripRef}
            className="work__strip"
            role="list"
            aria-label="Selected projects"
            tabIndex={nativeHorizontalScroll ? 0 : -1}
          >
            {projects.map((project) => (
              <li key={project.id} className="work__cell" data-home-reveal role="listitem">
                <Link to={hrefWork(project.slug)} className="work__tile">
                  <div className="work__tile-frame">
                    <img
                      src={project.coverSrc}
                      alt=""
                      width={640}
                      height={853}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                  <div className="work__tile-copy">
                    <p className="work__tile-title">{project.title}</p>
                    <p className="work__tile-tagline">{project.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HomeSlideLayout>
  )
}
