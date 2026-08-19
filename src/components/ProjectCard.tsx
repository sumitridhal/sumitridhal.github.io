import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import type { ImageKey, Project } from '@/data/projectsData'
import dimensions from '@/data/image-dimensions.json'
import lqip from '@/data/lqip-data.json'
import { hrefWork } from '@/i18n/routes'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [loaded, setLoaded] = useState(false)
  const key = project.imageKey as ImageKey
  const dim = dimensions[key]
  const lqipSrc = (lqip as Record<string, string | undefined>)[key]
  const width = dim?.width ?? 1024
  const height = dim?.height ?? 640

  return (
    <article className="project-card">
      <Link to={hrefWork(project.slug)} className="project-card__link">
        <div
          className={`project-card__media${loaded ? ' project-card__media--loaded' : ''}`}
          style={
            {
              '--ar-w': width,
              '--ar-h': height,
            } as CSSProperties
          }
        >
          {lqipSrc ? (
            <img
              className="project-card__lqip"
              src={lqipSrc}
              alt=""
              width={width}
              height={height}
              decoding="async"
            />
          ) : null}
          <img
            className={`project-card__img${loaded ? ' project-card__img--loaded' : ''}`}
            src={project.coverSrc}
            alt={project.title}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        </div>
        <div className="project-card__body">
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__tag">{project.tagline}</p>
        </div>
      </Link>
    </article>
  )
}
