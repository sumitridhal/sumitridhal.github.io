import { useEffect, useRef, useState } from 'react'

import type { HomeExperiment } from '@/data/experimentsData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type ExperimentMediaProps = {
  item: HomeExperiment
  className?: string
  playback?: 'auto' | 'hover'
}

export function ExperimentMedia({
  item,
  className = 'collage__media',
  playback = 'auto',
}: ExperimentMediaProps) {
  const reducedMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const [isEngaged, setIsEngaged] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion || playback === 'hover') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '200px' },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [playback, reducedMotion])

  useEffect(() => {
    const video = videoRef.current
    const shouldPlay =
      playback === 'auto' ? isNearViewport : isEngaged

    if (!video || !shouldPlay || reducedMotion) {
      if (playback === 'hover') video?.pause()
      return
    }

    video.load()
    void video.play().catch(() => {
      // The poster remains visible if a browser blocks playback.
    })
  }, [isEngaged, isNearViewport, playback, reducedMotion])

  if (reducedMotion) {
    return (
      <img
        className={className}
        src={item.posterSrc}
        alt={item.alt}
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      className={className}
      aria-label={item.alt}
      poster={item.posterSrc}
      width={720}
      height={720}
      autoPlay={playback === 'auto'}
      loop
      muted
      playsInline
      preload="none"
      tabIndex={playback === 'hover' ? 0 : undefined}
      onPointerEnter={() => playback === 'hover' && setIsEngaged(true)}
      onPointerLeave={() => playback === 'hover' && setIsEngaged(false)}
      onFocus={() => playback === 'hover' && setIsEngaged(true)}
      onBlur={() => playback === 'hover' && setIsEngaged(false)}
    >
      {(playback === 'auto' ? isNearViewport : isEngaged) ? (
        <>
          <source src={item.webmSrc} type="video/webm" />
          <source src={item.mediaSrc} type="video/mp4" />
        </>
      ) : null}
    </video>
  )
}
