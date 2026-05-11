import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/AppShell'
import { AboutPage } from '@/pages/AboutPage'
import { ExperimentsPage } from '@/pages/ExperimentsPage'
import { HomePage } from '@/pages/HomePage'
import { ProjectPage } from '@/pages/ProjectPage'
import { WritingPage } from '@/pages/WritingPage'
import { WritingsGalleryPage } from '@/pages/WritingsGalleryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="experiments" element={<ExperimentsPage />} />
        <Route path="writing" element={<WritingsGalleryPage />} />
        <Route path="writing/:slug" element={<WritingPage />} />
        <Route path="work/:slug" element={<ProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
