import { useState, type CSSProperties, type FocusEvent } from 'react'

import { projects, type Project } from '@/data/projectsData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

import { DeckBentoCenter } from '@/components/work-picker/DeckBentoCenter'
import { DeckCardLayout } from '@/components/work-picker/DeckCardLayout'
import { DeckLocaleFloat } from '@/components/work-picker/DeckLocaleFloat'

const DEFAULT_TOP_INDEX = 2

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

type DeckPickerListProps = {
  project: Project
  topIndex: number
  onSelect: (index: number) => void
}

function DeckPickerList({ project, topIndex, onSelect }: DeckPickerListProps) {
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
  const [topIndex, setTopIndex] = useState(DEFAULT_TOP_INDEX)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDeckBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setIsExpanded(false)
  }

  const { leftIndex, rightIndex } = getSideSlots(topIndex)
  const leftCard = project.deckCards[leftIndex]
  const rightCard = project.deckCards[rightIndex]

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
          className={`work-picker__deck-card work-picker__deck-card--center work-picker__deck-card--${project.centerVariant}`}
          data-slot="center"
          data-layer={topIndex}
        >
          {project.centerVariant === 'bento' ? (
            <DeckBentoCenter project={project} topIndex={topIndex} onSelect={setTopIndex} />
          ) : (
            <DeckPickerList project={project} topIndex={topIndex} onSelect={setTopIndex} />
          )}
        </div>

        <button
          type="button"
          className="work-picker__deck-card work-picker__deck-card--layout"
          data-slot="left"
          data-layer={leftIndex}
          data-layout={leftCard.layout}
          aria-label={`Select ${leftCard.title}`}
          onClick={() => setTopIndex(leftIndex)}
        >
          <DeckCardLayout card={leftCard} cardAccent={project.theme.accent} />
        </button>

        <button
          type="button"
          className="work-picker__deck-card work-picker__deck-card--layout"
          data-slot="right"
          data-layer={rightIndex}
          data-layout={rightCard.layout}
          aria-label={`Select ${rightCard.title}`}
          onClick={() => setTopIndex(rightIndex)}
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
    <div className="work-picker" data-home-reveal>
      <div className="work-picker__stage" role="group" aria-label="Selected projects">
        {projects.map((project, index) => (
          <ProjectDeck key={project.id} project={project} columnIndex={index} />
        ))}
      </div>
    </div>
  )
}
