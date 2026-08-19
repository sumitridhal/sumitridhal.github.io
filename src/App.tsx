import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/AppShell'
import { AboutPage } from '@/pages/AboutPage'
import { HomePage } from '@/pages/HomePage'
import { NotePage } from '@/pages/NotePage'
import { NotesGalleryPage } from '@/pages/NotesGalleryPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { ReadingPage } from '@/pages/ReadingPage'
import { SectionsPage } from '@/pages/SectionsPage'
import { WritingPage } from '@/pages/WritingPage'
import { WritingsGalleryPage } from '@/pages/WritingsGalleryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="writing" element={<WritingsGalleryPage />} />
        <Route path="writing/:slug" element={<WritingPage />} />
        <Route path="notes" element={<NotesGalleryPage />} />
        <Route path="notes/:slug" element={<NotePage />} />
        <Route path="reading" element={<ReadingPage />} />
        <Route path="work/:slug" element={<ProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
