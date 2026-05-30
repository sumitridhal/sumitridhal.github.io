export type WritingBentoCardsPreviewProps = {
  caption?: string
  className?: string
}

export function WritingBentoCardsPreview({
  caption = 'Code-built bento grid: same four-column span map as the snippets below.',
  className = '',
}: WritingBentoCardsPreviewProps) {
  return (
    <figure className={`writing-bento-preview ${className}`.trim()}>
      {caption ? <figcaption className="writing-bento-preview__caption">{caption}</figcaption> : null}
      <div className="writing-bento-preview__frame">
        <div className="writing-bento-preview__phone">
          <div className="writing-bento-preview__status-bar" aria-hidden>
            <span>9:41</span>
            <span className="writing-bento-preview__status-icons">●●●</span>
          </div>
          <div className="writing-bento-preview__grid">
            <article className="writing-bento-preview__tile writing-bento-preview__tile--stat" data-variant="white">
              <p className="writing-bento-preview__stat-label">Tasks</p>
              <p className="writing-bento-preview__stat-value">12</p>
            </article>

            <article
              className="writing-bento-preview__tile writing-bento-preview__tile--task"
              data-variant="white"
            >
              <h3 className="writing-bento-preview__task-title">Meet Alena at the cafe</h3>
              <p className="writing-bento-preview__pill">Today, 20:00</p>
            </article>

            <article
              className="writing-bento-preview__tile writing-bento-preview__tile--hero"
              data-variant="gradient"
            >
              <h3 className="writing-bento-preview__hero-title">Work Life</h3>
            </article>

            <article className="writing-bento-preview__tile writing-bento-preview__tile--glass" data-variant="glass">
              <p className="writing-bento-preview__glass-label">W/L balance</p>
              <p className="writing-bento-preview__glass-value">Perfect</p>
              <div className="writing-bento-preview__gauge" aria-hidden>
                <span className="writing-bento-preview__gauge-arc" />
              </div>
            </article>

            <article className="writing-bento-preview__tile writing-bento-preview__tile--cta" data-variant="white">
              <span className="writing-bento-preview__cta-pill">Connect +</span>
            </article>

            <article
              className="writing-bento-preview__tile writing-bento-preview__tile--avatars"
              data-variant="white"
            >
              <div className="writing-bento-preview__avatar-row" aria-hidden>
                <span className="writing-bento-preview__avatar" />
                <span className="writing-bento-preview__avatar" />
                <span className="writing-bento-preview__avatar" />
              </div>
              <p className="writing-bento-preview__avatars-copy">3 meetings left</p>
            </article>

            <article
              className="writing-bento-preview__tile writing-bento-preview__tile--progress"
              data-variant="white"
            >
              <div className="writing-bento-preview__progress-row">
                <p className="writing-bento-preview__progress-value">57%</p>
                <span className="writing-bento-preview__book" aria-hidden />
              </div>
              <p className="writing-bento-preview__progress-label">Reading progress</p>
            </article>

            <article className="writing-bento-preview__tile writing-bento-preview__tile--tips" data-variant="white">
              <span className="writing-bento-preview__tips-pill">15+ more tips</span>
            </article>
          </div>
        </div>
      </div>
    </figure>
  )
}
