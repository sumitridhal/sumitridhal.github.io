import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from 'react'

import type { WritingPreviewStep } from '@/data/writingTypes'

type WritingPreviewStepsContextValue = {
  steps: WritingPreviewStep[]
  isStacked: boolean
  registerCue: (id: string, element: HTMLElement | null) => void
}

const WritingPreviewStepsContext =
  createContext<WritingPreviewStepsContextValue | null>(null)

export type WritingPreviewStepsProviderProps = WritingPreviewStepsContextValue & {
  children: ReactNode
}

export function WritingPreviewStepsProvider({
  steps,
  isStacked,
  registerCue,
  children,
}: WritingPreviewStepsProviderProps) {
  return (
    <WritingPreviewStepsContext.Provider value={{ steps, isStacked, registerCue }}>
      {children}
    </WritingPreviewStepsContext.Provider>
  )
}

export function WritingPreviewCue({ id }: { id: string }) {
  const context = useContext(WritingPreviewStepsContext)
  const register = useCallback(
    (element: HTMLSpanElement | null) => {
      context?.registerCue(id, element)
    },
    [context, id],
  )

  if (!context) return null

  const step = context.steps.find((candidate) => candidate.id === id)
  if (!step) return null

  if (context.isStacked) {
    return (
      <div className="writing-preview-cue writing-preview-cue--inline">
        {step.node}
      </div>
    )
  }

  return (
    <span
      ref={register}
      className="writing-preview-cue writing-preview-cue--marker"
      data-preview-cue={id}
      aria-hidden="true"
    />
  )
}
