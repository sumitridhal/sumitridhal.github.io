import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrambleTextPlugin)

type ScrambleNameProps = {
  idle: string
  revealed: string
}

export function ScrambleName({ idle, revealed }: ScrambleNameProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const pointerInitiatedFocusRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const isRevealed = isHovered || isKeyboardFocused || isPinned

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const text = isRevealed ? revealed : idle
    gsap.killTweensOf(element)

    if (reducedMotion || element.textContent === text) {
      element.textContent = text
      return
    }

    gsap.to(element, {
      duration: 0.7,
      scrambleText: {
        text,
        chars: 'upperAndLowerCase',
        speed: 0.6,
      },
      ease: 'none',
    })

    return () => {
      gsap.killTweensOf(element)
    }
  }, [idle, isRevealed, reducedMotion, revealed])

  return (
    <button
      type="button"
      className="scramble-name"
      aria-pressed={isPinned}
      onPointerDown={() => {
        pointerInitiatedFocusRef.current = true
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setIsHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setIsHovered(false)
      }}
      onFocus={() => {
        if (!pointerInitiatedFocusRef.current) setIsKeyboardFocused(true)
      }}
      onBlur={() => {
        pointerInitiatedFocusRef.current = false
        setIsKeyboardFocused(false)
      }}
      onClick={() => {
        setIsPinned((current) => !current)
        pointerInitiatedFocusRef.current = false
      }}
    >
      <span ref={textRef} aria-hidden="true">
        {idle}
      </span>
      <span className="scramble-name__cursor" aria-hidden="true">
        _
      </span>
      <span className="scramble-name__label">
        {idle} ({revealed})
      </span>
    </button>
  )
}
