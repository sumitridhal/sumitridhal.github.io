import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'

import { AppStateProvider } from '@/contexts/AppStateContext'
import { I18nProvider } from '@/contexts/I18nContext'
import { Intro } from '@/components/Intro'
import { pathnameLocale } from '@/i18n/routes'
import { LenisProvider } from '@/providers/LenisProvider'

import App from '@/App.tsx'

import '@/styles/globals.scss'

export function AppRoot() {
  const { pathname } = useLocation()
  return (
    <I18nProvider locale={pathnameLocale(pathname)}>
      <App />
      <Intro />
    </I18nProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LenisProvider>
        <AppStateProvider>
          <AppRoot />
        </AppStateProvider>
      </LenisProvider>
    </BrowserRouter>
  </StrictMode>,
)
