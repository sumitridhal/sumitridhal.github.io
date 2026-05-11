import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

import enCommon from '@/i18n/locales/en/common.json'
import enNav from '@/i18n/locales/en/nav.json'
import enPages from '@/i18n/locales/en/pages.json'

type Messages = Record<string, unknown>

const bundle: Messages = {
  common: enCommon,
  nav: enNav,
  pages: enPages,
}

function readPath(obj: unknown, parts: string[]): string | undefined {
  let cur: unknown = obj
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

type I18nContextValue = {
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: string) => {
    const parts = key.split('.')
    return readPath(bundle, parts) ?? key
  }, [])

  const value = useMemo(() => ({ t }), [t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
