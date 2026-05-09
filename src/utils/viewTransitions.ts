export function startViewTransition(update: () => void): void {
  if (typeof document === 'undefined') {
    update()
    return
  }
  const anyDoc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }
  if (typeof anyDoc.startViewTransition === 'function') {
    anyDoc.startViewTransition(update)
  } else {
    update()
  }
}
