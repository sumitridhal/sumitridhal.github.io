import type { ReactNode } from 'react'

type HomeSlideLayoutProps = {
  reverse?: boolean
  media?: ReactNode
  /** When true, media column is hidden from assistive tech (decorative only). */
  mediaDecorative?: boolean
  title: ReactNode
  titleId?: string
  lead?: ReactNode
  children: ReactNode
  className?: string
}

export function HomeSlideLayout({
  reverse = false,
  media,
  mediaDecorative = false,
  title,
  titleId,
  lead,
  children,
  className = '',
}: HomeSlideLayoutProps) {
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
            <h2 id={titleId} className="home-slide__title">
              {title}
            </h2>
          ) : (
            <h2 className="home-slide__title">{title}</h2>
          )}
          {lead ? <p className="home-slide__lead">{lead}</p> : null}
        </header>
        <div className="home-slide__body">{children}</div>
      </div>
    </div>
  )
}
