import { useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from 'react'

import { projects, type Project } from '@/data/projectsData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useWorkDeckScrollScrub } from '@/hooks/useWorkDeckScrollScrub'

import { DeckBentoCenter } from '@/components/work-picker/DeckBentoCenter'
import { DeckCardLayout } from '@/components/work-picker/DeckCardLayout'
import { DeckLocaleFloat } from '@/components/work-picker/DeckLocaleFloat'

const DEFAULT_CENTER_INDEX = 2

type DeckSlot = 'left' | 'center' | 'right'

/** Maps each card index to a fan slot for a given center card. */
const DECK_SLOT_BY_CENTER: Record<number, Record<number, DeckSlot>> = {
  0: { 0: 'center', 1: 'right', 2: 'left' },
  1: { 0: 'left', 1: 'center', 2: 'right' },
  2: { 0: 'left', 1: 'right', 2: 'center' },
}

function getDeckSlot(cardIndex: number, centerIndex: number): DeckSlot {
  return DECK_SLOT_BY_CENTER[centerIndex][cardIndex]
}

function deckThemeStyle(project: Project): CSSProperties {
  return {
    '--deck-bg': project.theme.bg,
    '--deck-fg': project.theme.fg,
    '--deck-muted': project.theme.muted,
    '--deck-accent': project.theme.accent,
    '--deck-surface': project.theme.surface,
  } as CSSProperties
}

type DeckNameListProps = {
  project: Project
  centerIndex: number
  onCenterSelect: (index: number) => void
  showSubtitle?: boolean
  className?: string
  ariaLabel?: string
}

function DeckNameList({
  project,
  centerIndex,
  onCenterSelect,
  showSubtitle = false,
  className,
  ariaLabel,
}: DeckNameListProps) {
  const listClassName = ['work-picker__name-list', className].filter(Boolean).join(' ')

  return (
    <ul
      className={listClassName}
      role="listbox"
      aria-label={ariaLabel ?? `${project.title} views`}
    >
      {project.deckCards.map((card, index) => {
        const isActive = index === centerIndex

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
                onCenterSelect(index)
              }}
            >
              <span className="work-picker__name-row-inner">
                {isActive ? <span className="work-picker__arrow" aria-hidden>→</span> : null}
                <span className="work-picker__name-text">{card.title}</span>
              </span>
              {showSubtitle && isActive ? (
                <span className="work-picker__name-subtitle">{project.listSubtitle}</span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type DeckPickerListProps = {
  project: Project
  centerIndex: number
  onCenterSelect: (index: number) => void
}

function DeckPickerList({ project, centerIndex, onCenterSelect }: DeckPickerListProps) {
  return (
    <div className="work-picker__list-panel">
      <DeckNameList
        project={project}
        centerIndex={centerIndex}
        onCenterSelect={onCenterSelect}
        showSubtitle
      />
      {project.localeFloat ? <DeckLocaleFloat data={project.localeFloat} /> : null}
    </div>
  )
}

type ProjectDeckProps = {
  project: Project
  columnIndex: number
  centerIndex: number
  onCenterSelect: (index: number) => void
  scrollActive: boolean
}

function ProjectDeck({
  project,
  columnIndex,
  centerIndex,
  onCenterSelect,
  scrollActive,
}: ProjectDeckProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)
  const deckCount = project.deckCards.length

  const handleCenterKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault()
      onCenterSelect(Math.min(deckCount - 1, centerIndex + 1))
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault()
      onCenterSelect(Math.max(0, centerIndex - 1))
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCenterSelect(DEFAULT_CENTER_INDEX)
    }
  }

  const handleDeckBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setIsExpanded(false)
  }

  return (
    <div
      className="work-picker__column"
      data-column={columnIndex}
      data-home-reveal
      style={deckThemeStyle(project)}
      tabIndex={0}
      onKeyDown={handleCenterKeyDown}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocusCapture={() => setIsExpanded(true)}
      onBlurCapture={handleDeckBlur}
      aria-roledescription="carousel"
      aria-label={`${project.title}, scroll or use arrow keys to change view`}
    >
      <div
        className={`work-picker__deck${reducedMotion ? ' work-picker__deck--reduced' : ''}`}
        data-expanded={isExpanded ? 'true' : undefined}
        data-scroll-active={scrollActive ? 'true' : undefined}
        data-center-index={centerIndex}
        role="group"
        aria-label={project.title}
      >
        {project.deckCards.map((card, index) => {
          const slot = getDeckSlot(index, centerIndex)
          const isCenter = slot === 'center'
          const isListCenter =
            isCenter && index === DEFAULT_CENTER_INDEX && project.centerVariant === 'list-picker'
          const isBentoCenter =
            isCenter && index === DEFAULT_CENTER_INDEX && project.centerVariant === 'bento'

          const className = [
            'work-picker__deck-card',
            isCenter ? 'work-picker__deck-card--center' : 'work-picker__deck-card--layout',
            isListCenter ? 'work-picker__deck-card--list-picker' : '',
            isBentoCenter ? 'work-picker__deck-card--bento' : '',
          ]
            .filter(Boolean)
            .join(' ')

          const sharedProps = {
            'data-slot': slot,
            'data-card-index': index,
            'data-layout': card.layout,
          }

          if (isListCenter || isBentoCenter) {
            return (
              <div key={card.id} className={className} {...sharedProps}>
                {isBentoCenter ? (
                  <DeckBentoCenter
                    project={project}
                    centerIndex={centerIndex}
                    onCenterSelect={onCenterSelect}
                  />
                ) : (
                  <DeckPickerList
                    project={project}
                    centerIndex={centerIndex}
                    onCenterSelect={onCenterSelect}
                  />
                )}
              </div>
            )
          }

          return (
            <button
              key={card.id}
              type="button"
              className={className}
              {...sharedProps}
              aria-label={
                isCenter ? `${card.title}, centered` : `Bring ${card.title} to center`
              }
              onClick={() => onCenterSelect(index)}
            >
              <DeckCardLayout card={card} cardAccent={project.theme.accent} />
            </button>
          )
        })}
      </div>

      <div className="work-picker__deck-footer">
        <p className="work-picker__project-title">{project.title}</p>
      </div>
    </div>
  )
}

export function HomeWorkPicker() {
  const reducedMotion = usePrefersReducedMotion()
  const [centerIndex, setCenterIndex] = useState(DEFAULT_CENTER_INDEX)
  const [scrollActive, setScrollActive] = useState(false)
  useWorkDeckScrollScrub({
    enabled: !reducedMotion && projects.length > 0,
    onScrollActiveChange: setScrollActive,
  })

  if (!projects.length) {
    return <p className="work-picker__empty">Projects are coming soon.</p>
  }

  return (
    <div className="work-picker">
      <div className="work-picker__stage" role="group" aria-label="Selected projects">
        {projects.map((project, index) => (
          <ProjectDeck
            key={project.id}
            project={project}
            columnIndex={index}
            centerIndex={centerIndex}
            onCenterSelect={setCenterIndex}
            scrollActive={scrollActive}
          />
        ))}
      </div>
    </div>
  )
}
