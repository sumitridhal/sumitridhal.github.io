import { Navigate, Route, Routes } from 'react-router-dom'

import { LocaleShell } from '@/components/LocaleShell'
import { defaultLocale } from '@/i18n/routes'
import { AboutPage } from '@/pages/AboutPage'
import { HomePage } from '@/pages/HomePage'
import { ProjectPage } from '@/pages/ProjectPage'
import { WritingPage } from '@/pages/WritingPage'
import { WritingsGalleryPage } from '@/pages/WritingsGalleryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLocale}`} replace />} />
      <Route path="/:lang" element={<LocaleShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="uber" element={<AboutPage />} />
        <Route path="writing" element={<WritingsGalleryPage />} />
        <Route path="writing/:slug" element={<WritingPage />} />
        <Route path="work/:slug" element={<ProjectPage />} />
        <Route path="projekte/:slug" element={<ProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to={`/${defaultLocale}`} replace />} />
    </Routes>
  )
}
