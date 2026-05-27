import { useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from 'react'

import { projects, type Project } from '@/data/projectsData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

import { DeckBentoCenter } from '@/components/work-picker/DeckBentoCenter'
import { DeckCardLayout } from '@/components/work-picker/DeckCardLayout'
import { DeckLocaleFloat } from '@/components/work-picker/DeckLocaleFloat'

const DEFAULT_FRONT_INDEX = 2

function deckThemeStyle(project: Project): CSSProperties {
  return {
    '--deck-bg': project.theme.bg,
    '--deck-fg': project.theme.fg,
    '--deck-muted': project.theme.muted,
    '--deck-accent': project.theme.accent,
    '--deck-surface': project.theme.surface,
  } as CSSProperties
}

type DeckPickerListProps = {
  project: Project
  frontIndex: number
  onFrontSelect: (index: number) => void
}

function DeckPickerList({ project, frontIndex, onFrontSelect }: DeckPickerListProps) {
  return (
    <div className="work-picker__list-panel">
      <ul className="work-picker__name-list" role="listbox" aria-label={`${project.title} views`}>
        {project.deckCards.map((card, index) => {
          const isActive = index === frontIndex

          return (
            <li key={card.id} className="work-picker__name-item" role="presentation">
              <button
                type="button"
                className="work-picker__name-row"
                role="option"
                aria-selected={isActive}
                data-active={isActive ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  onFrontSelect(index)
                }}
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
      {project.localeFloat ? <DeckLocaleFloat data={project.localeFloat} /> : null}
    </div>
  )
}

type ProjectDeckProps = {
  project: Project
  columnIndex: number
}

function ProjectDeck({ project, columnIndex }: ProjectDeckProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [frontIndex, setFrontIndex] = useState(DEFAULT_FRONT_INDEX)
  const [isExpanded, setIsExpanded] = useState(false)

  const leftCard = project.deckCards[0]
  const rightCard = project.deckCards[1]

  const handleDeckBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setIsExpanded(false)
  }

  const bringCenterToFront = () => setFrontIndex(2)

  const handleCenterKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      bringCenterToFront()
    }
  }

  return (
    <div
      className="work-picker__column"
      data-column={columnIndex}
      data-home-reveal
      style={deckThemeStyle(project)}
    >
      <div
        className={`work-picker__deck${reducedMotion ? ' work-picker__deck--reduced' : ''}`}
        data-expanded={isExpanded ? 'true' : undefined}
        data-front-index={frontIndex}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocusCapture={() => setIsExpanded(true)}
        onBlurCapture={handleDeckBlur}
        role="group"
        aria-label={project.title}
      >
        <div
          className={`work-picker__deck-card work-picker__deck-card--center work-picker__deck-card--${project.centerVariant}`}
          data-slot="center"
          data-card-index={2}
          tabIndex={0}
          onClick={bringCenterToFront}
          onKeyDown={handleCenterKeyDown}
        >
          {project.centerVariant === 'bento' ? (
            <DeckBentoCenter
              project={project}
              frontIndex={frontIndex}
              onFrontSelect={setFrontIndex}
            />
          ) : (
            <DeckPickerList
              project={project}
              frontIndex={frontIndex}
              onFrontSelect={setFrontIndex}
            />
          )}
        </div>

        <button
          type="button"
          className="work-picker__deck-card work-picker__deck-card--layout"
          data-slot="left"
          data-card-index={0}
          data-layout={leftCard.layout}
          aria-label={`Bring ${leftCard.title} to front`}
          onClick={() => setFrontIndex(0)}
        >
          <DeckCardLayout card={leftCard} cardAccent={project.theme.accent} />
        </button>

        <button
          type="button"
          className="work-picker__deck-card work-picker__deck-card--layout"
          data-slot="right"
          data-card-index={1}
          data-layout={rightCard.layout}
          aria-label={`Bring ${rightCard.title} to front`}
          onClick={() => setFrontIndex(1)}
        >
          <DeckCardLayout card={rightCard} cardAccent={project.theme.accent} />
        </button>
      </div>
    </div>
  )
}

export function HomeWorkPicker() {
  if (!projects.length) {
    return <p className="work-picker__empty">Projects are coming soon.</p>
  }

  return (
    <div className="work-picker">
      <div className="work-picker__stage" role="group" aria-label="Selected projects">
        {projects.map((project, index) => (
          <ProjectDeck key={project.id} project={project} columnIndex={index} />
        ))}
      </div>
    </div>
  )
}
