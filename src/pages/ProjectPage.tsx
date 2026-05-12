import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import dimensions from '@/data/image-dimensions.json'
import { getProjectDetail } from '@/data/projectDetails'
import { getProjectBySlug } from '@/data/projectsData'
import { hrefHome } from '@/i18n/routes'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useI18n()
  const navigate = useViewTransitionNavigate()

  const project = useMemo(() => (slug ? getProjectBySlug(slug) : undefined), [slug])

  if (!slug || !project) {
    return (
      <Navigate
        to={{ pathname: hrefHome, hash: 'work' }}
        replace
      />
    )
  }

  const key = project.imageKey
  const dim = dimensions[key]
  const detail = getProjectDetail(project.slug)

  const role = detail?.role ?? 'Lead front-end'
  const year = detail?.year ?? '2025'
  const stack = detail?.stack ?? 'React, WebGL, Vite'

  return (
    <article className="project-page">
      <button
        type="button"
        className="project-page__back"
        onClick={() =>
          navigate({ pathname: hrefHome, hash: 'work' })
        }
      >
        {t('pages.project.back')}
      </button>
      <h1 className="project-page__title">{project.title}</h1>
      <p className="project-page__tagline">{project.tagline}</p>
      <ul className="project-page__meta">
        <li>
          <strong>{t('pages.project.role')}</strong> — {role}
        </li>
        <li>
          <strong>{t('pages.project.year')}</strong> — {year}
        </li>
        <li>
          <strong>{t('pages.project.stack')}</strong> — {stack}
        </li>
      </ul>
      <figure className="project-page__figure">
        <img
          src={project.coverSrc}
          alt={project.title}
          width={dim.width}
          height={dim.height}
        />
      </figure>
      {detail ? (
        <div className="project-page__body">
          {detail.intro.map((paragraph, i) => (
            <p key={i} className="project-page__prose">
              {paragraph}
            </p>
          ))}
          {detail.highlights.length > 0 ? (
            <>
              <h2 className="project-page__section-title">
                {t('pages.project.highlightsHeading')}
              </h2>
              <ul className="project-page__highlights">
                {detail.highlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          {detail.gallery?.map((item) => (
            <figure key={item.src} className="project-page__figure">
              <img
                src={item.src}
                alt={item.alt}
                {...(item.width != null && item.height != null
                  ? { width: item.width, height: item.height }
                  : {})}
              />
            </figure>
          ))}
        </div>
      ) : null}
    </article>
  )
}
