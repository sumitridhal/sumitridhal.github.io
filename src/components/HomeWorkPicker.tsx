import { useState, type CSSProperties, type FocusEvent } from 'react'

import {
  projects,
  type Project,
  type ProjectDeckCard,
  type ProjectPreviewScene,
} from '@/data/projectsData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const DEFAULT_TOP_INDEX = 2

type DeckCardSlot = 'left' | 'right'

function deckThemeStyle(project: Project): CSSProperties {
  return {
    '--deck-bg': project.theme.bg,
    '--deck-fg': project.theme.fg,
    '--deck-muted': project.theme.muted,
    '--deck-accent': project.theme.accent,
    '--deck-surface': project.theme.surface,
  } as CSSProperties
}

function getSideSlots(topIndex: number): { leftIndex: number; rightIndex: number } {
  const sideIndices = [0, 1, 2].filter((index) => index !== topIndex)
  return {
    leftIndex: sideIndices[0] ?? 0,
    rightIndex: sideIndices[1] ?? 1,
  }
}

function DeckPreviewScene({ scene, label }: { scene: ProjectPreviewScene; label: string }) {
  if (scene === 'kiosk') {
    return (
      <div className="work-picker__scene work-picker__scene--kiosk" aria-hidden>
        <div className="work-picker__scene-kiosk-header">Transfer Money</div>
        <div className="work-picker__scene-kiosk-body">
          <span className="work-picker__scene-kiosk-amount">$1,250.00</span>
          <span className="work-picker__scene-kiosk-caption">{label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="work-picker__scene work-picker__scene--tokens" aria-hidden>
      <div className="work-picker__scene-tokens-row">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="work-picker__scene-tokens-blocks">
        <span />
        <span />
      </div>
      <span className="work-picker__scene-tokens-caption">{label}</span>
    </div>
  )
}

function DeckUiPreviewCard({ scene, label }: { scene: ProjectPreviewScene; label: string }) {
  return (
    <div className="work-picker__ui-preview" aria-hidden>
      <DeckPreviewScene scene={scene} label={label} />
    </div>
  )
}

type DeckSidePanelProps = {
  card: ProjectDeckCard
  side: 'left' | 'right'
  scene: ProjectPreviewScene
}

function DeckSidePanel({ card, side, scene }: DeckSidePanelProps) {
  return (
    <>
      <header className="work-picker__side-header">
        {side === 'left' ? (
          <span className="work-picker__side-mark">HERO</span>
        ) : (
          <span className="work-picker__side-menu" aria-hidden />
        )}
      </header>
      <h3 className="work-picker__side-title">{card.title}</h3>
      <p className="work-picker__side-category">{card.pill}</p>
      <p className="work-picker__side-copy">{card.body}</p>
      <DeckUiPreviewCard scene={scene} label={card.previewLabel ?? card.pill} />
    </>
  )
}

type DeckPickerListProps = {
  project: Project
  topIndex: number
  onSelect: (index: number) => void
}

function DeckPickerList({ project, topIndex, onSelect }: DeckPickerListProps) {
  const activeCard = project.deckCards[topIndex]

  return (
    <div className="work-picker__list-panel">
      <ul className="work-picker__name-list" role="listbox" aria-label={`${project.title} views`}>
        {project.deckCards.map((card, index) => {
          const isActive = index === topIndex

          return (
            <li key={card.id} className="work-picker__name-item" role="presentation">
              <button
                type="button"
                className="work-picker__name-row"
                role="option"
                aria-selected={isActive}
                data-active={isActive ? 'true' : undefined}
                onClick={() => onSelect(index)}
              >
                <span className="work-picker__name-row-inner">
                  {isActive ? <span className="work-picker__arrow" aria-hidden>→</span> : null}
                  <span className="work-picker__name-text">{card.title}</span>
                </span>
                {isActive ? (
                  <span className="work-picker__name-subtitle">{project.listSubtitle}</span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="work-picker__float-card">
        <DeckPreviewScene
          scene={project.previewScene}
          label={activeCard.previewLabel ?? activeCard.pill}
        />
      </div>
    </div>
  )
}

type ProjectDeckProps = {
  project: Project
  columnIndex: number
}

function ProjectDeck({ project, columnIndex }: ProjectDeckProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [topIndex, setTopIndex] = useState(DEFAULT_TOP_INDEX)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDeckBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setIsExpanded(false)
  }

  return (
    <div className="work-picker__column" data-column={columnIndex} style={deckThemeStyle(project)}>
      <div
        className={`work-picker__deck${reducedMotion ? ' work-picker__deck--reduced' : ''}`}
        data-expanded={isExpanded ? 'true' : undefined}
        data-top-index={topIndex}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocusCapture={() => setIsExpanded(true)}
        onBlurCapture={handleDeckBlur}
        role="group"
        aria-label={project.title}
      >
        <div
          className="work-picker__deck-card work-picker__deck-card--list"
          data-slot="center"
          data-layer={topIndex}
        >
          <DeckPickerList project={project} topIndex={topIndex} onSelect={setTopIndex} />
        </div>

        {(() => {
          const { leftIndex, rightIndex } = getSideSlots(topIndex)

          return (
            <>
              <button
                key={project.deckCards[leftIndex].id}
                type="button"
                className="work-picker__deck-card"
                data-slot="left"
                data-layer={leftIndex}
                aria-label={`Select ${project.deckCards[leftIndex].title}`}
                onClick={() => setTopIndex(leftIndex)}
              >
                <DeckSidePanel
                  card={project.deckCards[leftIndex]}
                  side="left"
                  scene={project.previewScene}
                />
              </button>
              <button
                key={project.deckCards[rightIndex].id}
                type="button"
                className="work-picker__deck-card"
                data-slot="right"
                data-layer={rightIndex}
                aria-label={`Select ${project.deckCards[rightIndex].title}`}
                onClick={() => setTopIndex(rightIndex)}
              >
                <DeckSidePanel
                  card={project.deckCards[rightIndex]}
                  side="right"
                  scene={project.previewScene}
                />
              </button>
            </>
          )
        })()}
      </div>
    </div>
  )
}

export function HomeWorkPicker() {
  if (!projects.length) {
    return <p className="work-picker__empty">Projects are coming soon.</p>
  }

  return (
    <div className="work-picker" data-home-reveal>
      <div className="work-picker__stage" role="group" aria-label="Selected projects">
        {projects.map((project, index) => (
          <ProjectDeck key={project.id} project={project} columnIndex={index} />
        ))}
      </div>
    </div>
  )
}
