import type { CSSProperties } from 'react'

import { HomePanel } from '@/components/HomePanel'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
import { HOME_SECTION_BANNERS } from '@/data/homeSectionBanners'

type BookItem = {
  id: string
  title: string
  author: string
  spineColor: string
  textColor: string
  pages: number
  coverSrc?: string
}

function spineWidthFromPages(pages: number): string {
  const minPages = 80
  const maxPages = 1200
  const minW = 50
  const maxW = 100
  const clamped = Math.min(maxPages, Math.max(minPages, pages))
  const t = (clamped - minPages) / (maxPages - minPages)
  return `${Math.round(minW + t * (maxW - minW))}px`
}

type HomeBookshelfSectionProps = {
  books: BookItem[]
}

export function HomeBookshelfSection({ books }: HomeBookshelfSectionProps) {
  return (
    <HomePanel
      id="books"
      theme="books"
      className="bookshelf"
      backgroundImage={HOME_SECTION_BANNERS.books}
      aria-labelledby="books-heading"
    >
      <HomeSlideLayout titleId="books-heading" title="Bookshelf">
        <div className="bookshelf__grid" role="list">
          {books.map((book) => (
            <article
              key={book.id}
              className="bookshelf__book"
              data-home-reveal
              role="listitem"
              aria-label={`${book.title}, ${book.author}, ${book.pages} pages`}
              style={
                {
                  '--book-width': spineWidthFromPages(book.pages),
                  '--book-spine-color': book.spineColor,
                  '--book-text-color': book.textColor,
                } as CSSProperties
              }
            >
              <span className="bookshelf__badge" aria-hidden="true">
                {book.author}
              </span>
              <div className="bookshelf__spine">
                <p className="bookshelf__title">{book.title}</p>
                <p className="bookshelf__author">{book.author}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSlideLayout>
    </HomePanel>
  )
}
