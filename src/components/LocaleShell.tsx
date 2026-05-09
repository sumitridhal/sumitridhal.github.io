import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'

import { defaultLocale, isLocale } from '@/i18n/routes'

import { MobileMenu } from '@/components/MobileMenu'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export function LocaleShell() {
  const { lang } = useParams<{ lang: string }>()
  const localeOk = isLocale(lang)

  useEffect(() => {
    if (!localeOk) return
    document.body.classList.add('home-theme')
    return () => {
      document.body.classList.remove('home-theme')
    }
  }, [localeOk])

  if (!localeOk) {
    return <Navigate to={`/${defaultLocale}`} replace />
  }

  return (
    <div className="app">
      <SiteHeader />
      <div className="app__smooth-wrapper">
        <main className="app__main">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <MobileMenu />
    </div>
  )
}
