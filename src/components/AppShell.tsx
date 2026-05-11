import { useEffect, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { MobileMenu } from '@/components/MobileMenu'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export function AppShell() {
  const location = useLocation()

  const isWritingRoute = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    return parts[0] === 'writing'
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.add('home-theme')
    return () => {
      document.body.classList.remove('home-theme')
    }
  }, [])

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
        <main className="app__main">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <MobileMenu />
    </div>
  )
}
