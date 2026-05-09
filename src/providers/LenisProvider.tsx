import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type Lenis from 'lenis'

import { lenisService } from '@/services/lenisService'

const LenisContext = createContext<Lenis | null>(null)

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(() => lenisService.instance)

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- Lenis singleton synced to context */
    const instance = lenisService.init({
      smoothWheel: true,
      lerp: 0.08,
    })
    setLenis(instance)
    return () => {
      lenisService.destroy()
      setLenis(null)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const value = useMemo(() => lenis, [lenis])

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}
