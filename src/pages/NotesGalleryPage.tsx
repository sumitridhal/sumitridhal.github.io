import { Link } from 'react-router-dom'

import { useI18n } from '@/contexts/I18nContext'
import { notes } from '@/data/notesRegistry'
import { hrefHome, hrefNote } from '@/i18n/routes'
import { formatWritingDate } from '@/utils/formatWritingDate'

export function NotesGalleryPage() {
  const { t } = useI18n()

  return (
    <div className="writings-gallery notes-gallery">
      <div className="writings-gallery__inner">
        <header className="writings-gallery__header">
          <p className="writings-gallery__kicker">{t('pages.notes.galleryCategory')}</p>
          <h1 className="writings-gallery__intro">{t('pages.notes.galleryHeroLead')}</h1>
        </header>

        {notes.length === 0 ? (
          <p className="writings-gallery__empty">{t('pages.notes.empty')}</p>
        ) : (
          <ul className="writings-gallery__list">
            {notes.map((note) => (
              <li key={note.id} className="writings-gallery__item">
                <Link to={hrefNote(note.id)} className="writings-gallery__row">
                  <span className="writings-gallery__row-title">{note.title}</span>
                  <span className="writings-gallery__row-meta">
                    {formatWritingDate(note.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="writings-gallery__footer">
          <Link className="writings-gallery__footer-link" to={hrefHome}>
            {t('pages.notes.backHome')}
          </Link>
        </p>
      </div>
    </div>
  )
}
