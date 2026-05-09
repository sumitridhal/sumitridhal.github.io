import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

import type { Locale } from '@/i18n/routes'

import enCommon from '@/i18n/locales/en/common.json'
import enNav from '@/i18n/locales/en/nav.json'
import enPages from '@/i18n/locales/en/pages.json'
import deCommon from '@/i18n/locales/de/common.json'
import deNav from '@/i18n/locales/de/nav.json'
import dePages from '@/i18n/locales/de/pages.json'
import frCommon from '@/i18n/locales/fr/common.json'
import frNav from '@/i18n/locales/fr/nav.json'
import frPages from '@/i18n/locales/fr/pages.json'
import hiCommon from '@/i18n/locales/hi/common.json'
import hiNav from '@/i18n/locales/hi/nav.json'
import hiPages from '@/i18n/locales/hi/pages.json'

type Messages = Record<string, unknown>

const bundles: Record<Locale, Messages> = {
  en: { common: enCommon, nav: enNav, pages: enPages },
  de: { common: deCommon, nav: deNav, pages: dePages },
  fr: { common: frCommon, nav: frNav, pages: frPages },
  hi: { common: hiCommon, nav: hiNav, pages: hiPages },
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
  locale: Locale
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const t = useCallback(
    (key: string) => {
      const parts = key.split('.')
      const fromLocale = readPath(bundles[locale], parts)
      if (fromLocale) return fromLocale
      const fallback = readPath(bundles.en, parts)
      return fallback ?? key
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
