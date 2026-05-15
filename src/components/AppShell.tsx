import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router-dom'

import { MobileMenu } from '@/components/MobileMenu'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { hrefHome, hrefSections } from '@/i18n/routes'

export function AppShell() {
  const location = useLocation()
  const isHome = useMatch({ path: hrefHome, end: true })

  const isSectionsRoute = location.pathname === hrefSections

  const isWritingRoute = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    return parts[0] === 'writing'
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('home-theme', Boolean(isHome))
    return () => {
      document.body.classList.remove('home-theme')
    }
  }, [isHome])

  useEffect(() => {
    if (!isWritingRoute) return
    document.body.classList.add('route-writing')
    return () => {
      document.body.classList.remove('route-writing')
    }
  }, [isWritingRoute])

  return (
    <div className="app">
      <SiteHeader />
      <div className="app__smooth-wrapper">
        {isSectionsRoute ? (
          <div className="app__main">
            <Outlet />
          </div>
        ) : (
          <main className="app__main">
            <Outlet />
          </main>
        )}
        {!isHome && !isSectionsRoute ? <SiteFooter /> : null}
      </div>
      <MobileMenu />
    </div>
  )
}
