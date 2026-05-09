import gsap from 'gsap'
import Lenis from 'lenis'

let lenis: Lenis | null = null

function onGsapFrame(): void {
  lenis?.raf(performance.now())
}

export const lenisService = {
  get instance(): Lenis | null {
    return lenis
  },

  init(options?: ConstructorParameters<typeof Lenis>[0]): Lenis {
    if (lenis) return lenis
    lenis = new Lenis({
      autoRaf: false,
      ...options,
    })
    gsap.ticker.add(onGsapFrame)
    gsap.ticker.lagSmoothing(1000, 16)
    return lenis
  },

  destroy(): void {
    gsap.ticker.remove(onGsapFrame)
    lenis?.destroy()
    lenis = null
  },
}
