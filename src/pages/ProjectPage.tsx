import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import dimensions from '@/data/image-dimensions.json'
import { resolveProjectSlug } from '@/data/projectsData'
import { hrefHome } from '@/i18n/routes'
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const { locale, t } = useI18n()
  const navigate = useViewTransitionNavigate()

  const project = useMemo(
    () => (slug ? resolveProjectSlug(locale, slug) : undefined),
    [locale, slug],
  )

  if (!slug || !project) {
    return (
      <Navigate
        to={{ pathname: hrefHome(locale), hash: 'work' }}
        replace
      />
    )
  }

  const key = project.imageKey
  const dim = dimensions[key]

  return (
    <article className="project-page">
      <button
        type="button"
        className="project-page__back"
        onClick={() =>
          navigate({ pathname: hrefHome(locale), hash: 'work' })
        }
      >
        {t('pages.project.back')}
      </button>
      <h1 className="project-page__title">{project.title[locale]}</h1>
      <p className="project-page__tagline">{project.tagline[locale]}</p>
      <ul className="project-page__meta">
        <li>
          <strong>{t('pages.project.role')}</strong> — Lead front-end
        </li>
        <li>
          <strong>{t('pages.project.year')}</strong> — 2025
        </li>
        <li>
          <strong>{t('pages.project.stack')}</strong> — React, WebGL, Vite
        </li>
      </ul>
      <figure className="project-page__figure">
        <img
          src={project.coverSrc}
          alt={project.title[locale]}
          width={dim.width}
          height={dim.height}
        />
      </figure>
    </article>
  )
}
