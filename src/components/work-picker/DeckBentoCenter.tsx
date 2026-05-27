import type { BentoTile, Project } from '@/data/projectsData'

type DeckBentoCenterProps = {
  project: Project
  centerIndex: number
  onCenterSelect: (index: number) => void
}

function BentoTileContent({ tile }: { tile: BentoTile }) {
  switch (tile.kind) {
    case 'amount':
      return (
        <div className="deck-bento__tile deck-bento__tile--amount">
          <p className="deck-bento__tile-title">{tile.title}</p>
          <p className="deck-bento__tile-sub">{tile.subtitle}</p>
          <p className="deck-bento__tile-amount">
            <span className="deck-bento__currency">$</span>
            {tile.amount.replace('$', '')}
          </p>
        </div>
      )
    case 'activity':
      return (
        <div className="deck-bento__tile deck-bento__tile--activity">
          <span className="deck-bento__avatar" aria-hidden>
            {tile.brand.slice(0, 1)}
          </span>
          <div className="deck-bento__activity-copy">
            <p className="deck-bento__activity-line">
              <strong>{tile.brand}</strong> · {tile.action}
            </p>
            <p className="deck-bento__activity-synced">{tile.synced}</p>
          </div>
          <span className="deck-bento__delta">{tile.delta}</span>
        </div>
      )
    case 'status':
      return (
        <div
          className="deck-bento__tile deck-bento__tile--status"
          data-tone={tile.tone ?? 'ok'}
        >
          <p className="deck-bento__status-label">{tile.label}</p>
          <p className="deck-bento__status-value">{tile.value}</p>
        </div>
      )
    default:
      return null
  }
}

export function DeckBentoCenter({ project, centerIndex, onCenterSelect }: DeckBentoCenterProps) {
  const tiles = project.bentoTiles ?? []

  return (
    <div className="deck-bento" role="group" aria-label={`${project.title} overview`}>
      <div className="deck-bento__grid" aria-hidden>
        {tiles.map((tile, index) => (
          <BentoTileContent key={`${tile.kind}-${index}`} tile={tile} />
        ))}
      </div>
      <ul className="deck-bento__nav" role="listbox" aria-label={`${project.title} layers`}>
        {project.deckCards.map((card, index) => {
          const isActive = index === centerIndex
          return (
            <li key={card.id} role="presentation">
              <button
                type="button"
                className="deck-bento__nav-btn"
                role="option"
                aria-selected={isActive}
                data-active={isActive ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  onCenterSelect(index)
                }}
              >
                {card.title}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
