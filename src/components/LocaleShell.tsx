import { Navigate, Outlet, useParams } from 'react-router-dom'

import { defaultLocale, isLocale } from '@/i18n/routes'

import { MobileMenu } from '@/components/MobileMenu'
import { SiteHeader } from '@/components/SiteHeader'

export function LocaleShell() {
  const { lang } = useParams<{ lang: string }>()
  if (!isLocale(lang)) {
    return <Navigate to={`/${defaultLocale}`} replace />
  }

  return (
    <div className="app">
      <SiteHeader />
      <div className="app__smooth-wrapper">
        <main className="app__main">
          <Outlet />
        </main>
      </div>
      <MobileMenu />
    </div>
  )
}
