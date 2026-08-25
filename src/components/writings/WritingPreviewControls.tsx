import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type WritingPreviewControlsProps = {
  /** One-line interaction hint; rendered as the figure's caption. */
  caption?: string
  /** Longer instructions shown inside the controls panel. */
  hint?: string
  /** Accessible name for the trigger and the controls panel. */
  label: string
  /** Lay the rows out in two columns, for panels with many controls. */
  dense?: boolean
  children: ReactNode
}

/**
 * Caption row plus the study's controls, moved into a dialog so the canvas keeps
 * the full height of the figure.
 */
export function WritingPreviewControls({
  caption,
  hint,
  label,
  dense = false,
  children,
}: WritingPreviewControlsProps) {
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      close()
    }
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target
      if (
        !(target instanceof Node) ||
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      close()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [close, open])

  return (
    <>
      <figcaption className="writing-preview-controls__bar">
        {caption ? (
          <span className="writing-preview-controls__caption">{caption}</span>
        ) : null}
        <button
          ref={triggerRef}
          type="button"
          className="writing-preview-controls__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Hide' : 'Show'} ${label}`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide controls' : 'Controls'}
        </button>
      </figcaption>

      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          role="group"
          aria-label={label}
          className={`writing-preview-controls__panel${
            dense ? ' writing-preview-controls__panel--dense' : ''
          }`}
        >
          <div className="writing-preview-controls__head">
            <p className="writing-preview-controls__title">{label}</p>
            <button
              type="button"
              className="writing-preview-controls__close"
              onClick={close}
            >
              Close
            </button>
          </div>
          {hint ? (
            <p className="writing-preview-controls__hint">{hint}</p>
          ) : null}
          <div
            className={`writing-generative-play-preview__hud${
              dense ? ' writing-generative-play-preview__hud--dense' : ''
            }`}
          >
            {children}
          </div>
        </div>
      ) : null}
    </>
  )
}
