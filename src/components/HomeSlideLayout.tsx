import type { ReactNode } from 'react'

type HomeSlideLayoutProps = {
  reverse?: boolean
  media?: ReactNode
  /** When true, media column is hidden from assistive tech (decorative only). */
  mediaDecorative?: boolean
  title: ReactNode
  titleId?: string
  lead?: ReactNode
  /** Page hero uses h1; section panels use h2 (default). */
  headingLevel?: 'h1' | 'h2'
  children?: ReactNode
  className?: string
}

export function HomeSlideLayout({
  reverse = false,
  media,
  mediaDecorative = false,
  title,
  titleId,
  lead,
  headingLevel = 'h2',
  children,
  className = '',
}: HomeSlideLayoutProps) {
  const Heading = headingLevel
  const stack = !media
  const rootClass = [
    'home-slide',
    reverse && !stack ? 'home-slide--reverse' : '',
    stack ? 'home-slide--stack' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      {media ? (
        <div
          className="home-slide__media"
          aria-hidden={mediaDecorative ? true : undefined}
          data-home-reveal-media
        >
          {media}
        </div>
      ) : null}
      <div className="home-slide__content">
        <header className="home-slide__header" data-home-reveal-content>
          {titleId ? (
            <Heading id={titleId} className="home-slide__title">
              {title}
            </Heading>
          ) : (
            <Heading className="home-slide__title">{title}</Heading>
          )}
          {lead ? <p className="home-slide__lead">{lead}</p> : null}
        </header>
        {children != null ? <div className="home-slide__body">{children}</div> : null}
      </div>
    </div>
  )
}
