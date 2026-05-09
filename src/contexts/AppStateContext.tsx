import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AppState = {
  introComplete: boolean
  menuOpen: boolean
  setIntroComplete: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  toggleMenu: () => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((o) => !o)
  }, [])

  const value = useMemo(
    () => ({
      introComplete,
      menuOpen,
      setIntroComplete,
      setMenuOpen,
      toggleMenu,
    }),
    [introComplete, menuOpen, toggleMenu],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}</AppStateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
