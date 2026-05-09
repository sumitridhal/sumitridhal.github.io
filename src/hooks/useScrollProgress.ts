import { useEffect, useState } from 'react'

import { useLenis } from '@/providers/LenisProvider'

export function useScrollProgress(): number {
  const lenis = useLenis()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!lenis) return

    const onScroll = () => {
      const max = lenis.limit || 1
      const p = max > 0 ? lenis.scroll / max : 0
      setProgress(Math.min(1, Math.max(0, p)))
    }

    onScroll()
    return lenis.on('scroll', onScroll)
  }, [lenis])

  return progress
}
