import type { ReactNode } from 'react'

import type { HomeThemeId } from '@/utils/homeTheme'

type HomePanelProps = {
  id: string
  theme: HomeThemeId
  className?: string
  /** Full-bleed section background image URL. */
  backgroundImage?: string
  /** Full viewport minimum (hero only). */
  hero?: boolean
  'aria-labelledby'?: string
  children: ReactNode
}

export function HomePanel({
  id,
  theme,
  className = '',
  backgroundImage,
  hero = false,
  'aria-labelledby': ariaLabelledby,
  children,
}: HomePanelProps) {
  const hasBanner = Boolean(backgroundImage)

  return (
    <section
      id={id}
      data-home-panel
      data-home-theme={theme}
      className={`home-section${hero ? ' home-section--hero' : ''}${hasBanner ? ' home-section--banner' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby={ariaLabelledby}
    >
      {hasBanner ? (
        <img
          className="home-section__banner-img"
          src={backgroundImage}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          aria-hidden
        />
      ) : null}
      <div className="home-section__inner">{children}</div>
    </section>
  )
}
