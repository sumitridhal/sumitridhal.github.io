import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

import { useLenisScrollTrigger } from '@/hooks/useLenisScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

type PointerBinding = {
  x: gsap.QuickToFunc
  y: gsap.QuickToFunc
  depth: number
}

export function useCollageParallax(rootRef: RefObject<HTMLElement | null>) {
  const reducedMotion = usePrefersReducedMotion()
  useLenisScrollTrigger()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const floats = Array.from(root.querySelectorAll<HTMLElement>('[data-collage-float]'))
    const pointers = Array.from(root.querySelectorAll<HTMLElement>('[data-collage-pointer]'))
    const narrowViewport = window.matchMedia('(max-width: 720px)').matches

    if (reducedMotion || narrowViewport) {
      gsap.set([...floats, ...pointers], { clearProps: 'transform' })
      return
    }

    const bindings: PointerBinding[] = pointers.map((pointer, index) => {
      const depth = Number(floats[index]?.dataset.depth ?? 0.5)
      return {
        x: gsap.quickTo(pointer, 'x', { duration: 0.7, ease: 'power3.out' }),
        y: gsap.quickTo(pointer, 'y', { duration: 0.7, ease: 'power3.out' }),
        depth,
      }
    })

    const onPointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect()
      const nx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const ny = ((event.clientY - bounds.top) / Math.min(bounds.height, window.innerHeight) - 0.5) * 2

      bindings.forEach(({ x, y, depth }) => {
        x(nx * (5 + depth * 11))
        y(ny * (3 + depth * 7))
      })
    }

    const resetPointer = () => {
      bindings.forEach(({ x, y }) => {
        x(0)
        y(0)
      })
    }

    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerleave', resetPointer)

    const context = gsap.context(() => {
      floats.forEach((float) => {
        const depth = Number(float.dataset.depth ?? 0.5)
        const travel = 24 + depth * 72

        gsap.fromTo(
          float,
          { y: travel * -0.45 },
          {
            y: travel * 0.55,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
      })
    }, root)

    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', resetPointer)
      context.revert()
      gsap.set([...floats, ...pointers], { clearProps: 'transform' })
    }
  }, [reducedMotion, rootRef])
}
