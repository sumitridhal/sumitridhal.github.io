import { useEffect, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'

import { defaultLocale, isLocale } from '@/i18n/routes'

import { MobileMenu } from '@/components/MobileMenu'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export function LocaleShell() {
  const { lang } = useParams<{ lang: string }>()
  const location = useLocation()
  const localeOk = isLocale(lang)

  const isWritingRoute = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    return parts.length >= 2 && parts[1] === 'writing'
  }, [location.pathname])

  useEffect(() => {
    if (!localeOk) return
    document.body.classList.add('home-theme')
    return () => {
      document.body.classList.remove('home-theme')
    }
  }, [localeOk])

  useEffect(() => {
    if (!isWritingRoute) return
    document.body.classList.add('route-writing')
    return () => {
      document.body.classList.remove('route-writing')
    }
  }, [isWritingRoute])

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
