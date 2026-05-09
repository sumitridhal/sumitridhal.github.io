const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&'

export type ScrambleTextOptions = {
  durationMs?: number
  charset?: string
  onUpdate?: (value: string) => void
}

export function scrambleText(
  target: string,
  {
    durationMs = 1200,
    charset = CHARSET,
    onUpdate,
  }: ScrambleTextOptions = {},
): Promise<string> {
  return new Promise((resolve) => {
    const start = performance.now()
    const chars = [...target]

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const reveal = Math.floor(t * chars.length)
      let out = ''
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]
        if (ch === ' ' || ch === '\n') {
          out += ch
          continue
        }
        if (i < reveal) {
          out += ch
        } else {
          out += charset[Math.floor(Math.random() * charset.length)] ?? '?'
        }
      }
      onUpdate?.(out)
      if (t >= 1) {
        onUpdate?.(target)
        resolve(target)
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}
