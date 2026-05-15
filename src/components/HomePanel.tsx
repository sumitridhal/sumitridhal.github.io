import type { CSSProperties, ReactNode } from 'react'

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

  const style = hasBanner
    ? ({
        '--home-section-banner': `url("${backgroundImage}")`,
      } as CSSProperties)
    : undefined

  return (
    <section
      id={id}
      data-home-panel
      data-home-theme={theme}
      className={`home-section${hero ? ' home-section--hero' : ''}${hasBanner ? ' home-section--banner' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      aria-labelledby={ariaLabelledby}
    >
      <div className="home-section__inner">{children}</div>
    </section>
  )
}
