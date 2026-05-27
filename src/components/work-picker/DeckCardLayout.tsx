import type { CSSProperties } from 'react'

import type {
  ActivityRow,
  CashFormData,
  LocaleOrbitData,
  ProjectDeckCard,
  RegistryRow,
  SpecTemplateData,
  SpotlightHeroData,
  SupportStatData,
} from '@/data/projectsData'

type DeckCardLayoutProps = {
  card: ProjectDeckCard
  cardAccent?: string
}

function ActivityFeedLayout({ rows, title }: { rows: ActivityRow[]; title: string }) {
  return (
    <article className="deck-card deck-card--activity">
      <header className="deck-card__activity-header">
        <h3 className="deck-card__activity-title">{title}</h3>
        <span className="deck-card__activity-filter" aria-hidden />
      </header>
      <ul className="deck-card__activity-list">
        {rows.map((row) => (
          <li key={`${row.brand}-${row.action}`} className="deck-card__activity-row">
            <span className="deck-card__activity-avatar" aria-hidden>
              {row.brand.slice(0, 1)}
            </span>
            <div className="deck-card__activity-copy">
              <p className="deck-card__activity-line">
                <strong>{row.brand}</strong> · {row.action}
              </p>
              <p className="deck-card__activity-synced">{row.synced}</p>
            </div>
            <span className="deck-card__activity-delta">{row.delta}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function RegistryListLayout({
  rows,
  title,
  body,
}: {
  rows: RegistryRow[]
  title: string
  body: string
}) {
  return (
    <article className="deck-card deck-card--registry">
      <header className="deck-card__registry-header">
        <span className="deck-card__registry-icon" aria-hidden />
        <div>
          <h3 className="deck-card__registry-title">{title}</h3>
          <p className="deck-card__registry-desc">{body}</p>
        </div>
      </header>
      <ul className="deck-card__registry-list">
        {rows.map((row) => (
          <li key={row.code} className="deck-card__registry-row">
            <span className="deck-card__registry-avatar">{row.initials}</span>
            <div className="deck-card__registry-copy">
              <p className="deck-card__registry-name">{row.name}</p>
              <p className="deck-card__registry-meta">{row.meta}</p>
            </div>
            <span className="deck-card__registry-code">{row.code}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function LocaleOrbitLayout({ data }: { data: LocaleOrbitData }) {
  return (
    <article
      className="deck-card deck-card--locale"
      style={{ '--card-accent': '#c8db3a' } as CSSProperties}
    >
      <span className="deck-card__locale-pill">{data.pill}</span>
      <h3 className="deck-card__locale-heading">{data.heading}</h3>
      <div className="deck-card__orbit" aria-hidden>
        <span className="deck-card__orbit-ring deck-card__orbit-ring--1" />
        <span className="deck-card__orbit-ring deck-card__orbit-ring--2" />
        <span className="deck-card__orbit-ring deck-card__orbit-ring--3" />
        <span className="deck-card__orbit-core">A</span>
        {data.markets.map((market, index) => (
          <span
            key={market}
            className="deck-card__orbit-chip"
            data-pos={index % 4}
          >
            {market}
          </span>
        ))}
      </div>
      <p className="deck-card__locale-body">{data.body}</p>
    </article>
  )
}

function SpotlightHeroLayout({ data }: { data: SpotlightHeroData }) {
  return (
    <article
      className="deck-card deck-card--spotlight"
      style={{ '--card-accent': '#8b5cf6' } as CSSProperties}
    >
      <div className="deck-card__spotlight-visual" aria-hidden>
        <span className="deck-card__spotlight-pill">{data.pill}</span>
        <span className="deck-card__spotlight-blob" />
        <span className="deck-card__spotlight-badge">
          <span className="deck-card__spotlight-badge-label">{data.badgeLabel}</span>
          <span className="deck-card__spotlight-badge-icon" />
        </span>
      </div>
      <h3 className="deck-card__spotlight-title">{data.title}</h3>
      <p className="deck-card__spotlight-body">{data.body}</p>
    </article>
  )
}

function CashFormLayout({ data }: { data: CashFormData }) {
  return (
    <article
      className="deck-card deck-card--cash"
      style={{ '--card-accent': '#3b82f6' } as CSSProperties}
    >
      <header className="deck-card__cash-header">
        <h3 className="deck-card__cash-title">{data.title}</h3>
        <p className="deck-card__cash-subtitle">{data.subtitle}</p>
      </header>
      <div className="deck-card__cash-amount" aria-hidden>
        <span className="deck-card__cash-currency">$</span>
        <span className="deck-card__cash-cursor" />
        <span className="deck-card__cash-value">{data.amount}</span>
      </div>
      <div className="deck-card__cash-fields">
        {data.fields.map((field) => (
          <div key={field.label} className="deck-card__cash-field">
            <span
              className={`deck-card__cash-field-icon deck-card__cash-field-icon--${field.icon}`}
              aria-hidden
            />
            <span className="deck-card__cash-field-label">{field.label}</span>
            <span
              className={`deck-card__cash-field-trail deck-card__cash-field-trail--${field.trailing}`}
              aria-hidden
            />
          </div>
        ))}
      </div>
      <span className="deck-card__cash-cta">{data.ctaLabel}</span>
      <p className="deck-card__cash-footer">{data.footer}</p>
    </article>
  )
}

function SupportStatLayout({ data }: { data: SupportStatData }) {
  return (
    <article className="deck-card deck-card--stat">
      <p className="deck-card__stat-value">{data.stat}</p>
      <div className="deck-card__stat-visual" aria-hidden />
      <p className="deck-card__stat-footer">{data.footer}</p>
    </article>
  )
}

function SpecTemplateLayout({ data }: { data: SpecTemplateData }) {
  return (
    <article className="deck-card deck-card--spec">
      <div className="deck-card__spec-inner">
        <span className="deck-card__spec-icon" aria-hidden>
          {data.iconLabel.slice(0, 1)}
        </span>
        <h3 className="deck-card__spec-title">{data.title}</h3>
        <p className="deck-card__spec-desc">{data.description}</p>
        <dl className="deck-card__spec-meta">
          {data.meta.map((row) => (
            <div key={row.label} className="deck-card__spec-meta-row">
              <dt className="deck-card__spec-meta-label">{row.label}</dt>
              <dd className="deck-card__spec-meta-value">{row.value}</dd>
            </div>
          ))}
        </dl>
        {data.sections.map((section) => (
          <div key={section.label} className="deck-card__spec-section">
            <p className="deck-card__spec-section-label">{section.label}</p>
            <p className="deck-card__spec-section-body">{section.body}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

export function DeckCardLayout({ card, cardAccent }: DeckCardLayoutProps) {
  const accentStyle = cardAccent
    ? ({ '--card-accent': cardAccent } as CSSProperties)
    : undefined

  switch (card.layout) {
    case 'activity-feed':
      return (
        <ActivityFeedLayout
          rows={card.activityRows ?? []}
          title={card.pill}
        />
      )
    case 'registry-list':
      return (
        <RegistryListLayout
          rows={card.registryRows ?? []}
          title={card.title}
          body={card.body}
        />
      )
    case 'locale-orbit':
      return card.localeOrbit ? (
        <LocaleOrbitLayout data={card.localeOrbit} />
      ) : null
    case 'spotlight-hero':
      return card.spotlight ? (
        <SpotlightHeroLayout data={card.spotlight} />
      ) : null
    case 'cash-form':
      return card.cashForm ? <CashFormLayout data={card.cashForm} /> : null
    case 'support-stat':
      return card.supportStat ? (
        <SupportStatLayout data={card.supportStat} />
      ) : null
    case 'spec-template':
      return card.specTemplate ? (
        <SpecTemplateLayout data={card.specTemplate} />
      ) : null
    default:
      return (
        <article className="deck-card" style={accentStyle}>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
        </article>
      )
  }
}
