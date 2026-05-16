export type BookItem = {
  id: string
  title: string
  author: string
  spineColor: string
  textColor: string
  pages: number
  coverSrc?: string
}

/** Same shelf as the home page bookshelf strip. */
export const bookshelf: BookItem[] = [
  {
    id: 'construction-of-social-reality',
    title: 'The Construction of Social Reality',
    author: 'John R. Searle',
    spineColor: '#02061f',
    textColor: '#f0f4fb',
    pages: 256,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780684831794-M.jpg',
  },
  {
    id: 'design-of-everyday-things',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    spineColor: '#f0de2f',
    textColor: '#141414',
    pages: 368,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780465050659-M.jpg',
  },
  {
    id: 'boxing-a-cultural-history',
    title: 'Boxing: A Cultural History',
    author: 'Kasia Boddy',
    spineColor: '#a72c31',
    textColor: '#f5f6f8',
    pages: 480,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9781861893697-M.jpg',
  },
  {
    id: 'dying-for-ideas',
    title: 'Dying for Ideas',
    author: 'Costica Bradatan',
    spineColor: '#3d2528',
    textColor: '#f4ebe0',
    pages: 256,
    coverSrc:
      'https://books.google.com/books/content?id=jOxJBgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'against-the-machine',
    title: 'Against the Machine',
    author: 'Paul Kingsnorth',
    spineColor: '#1f5d2d',
    textColor: '#f0f7ef',
    pages: 368,
    coverSrc:
      'https://books.google.com/books/content?id=dbod0QEACAAJ&printsec=frontcover&img=1&zoom=2&edge=nocurl&source=gbs_api',
  },
  {
    id: 'cultural-ideologies-romania',
    title: 'Ideologies in Contemporary Romania',
    author: 'Claude Karnoouh',
    spineColor: '#dde0e3',
    textColor: '#2b3039',
    pages: 304,
  },
  {
    id: 'rupa-eu-blestemul',
    title: 'Rupea blestemului',
    author: 'Catalin Pavel',
    spineColor: '#c4174a',
    textColor: '#fbf2f5',
    pages: 288,
  },
  {
    id: 'simple-genius',
    title: 'Simple Genius',
    author: 'David Baldacci',
    spineColor: '#eceeef',
    textColor: '#121722',
    pages: 420,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/9780446581738-M.jpg',
  },
  {
    id: 'drumul-catre-servitute',
    title: 'Drumul catre servitute',
    author: 'Friedrich A. Hayek',
    spineColor: '#22234e',
    textColor: '#eef2ff',
    pages: 316,
    coverSrc: 'https://covers.openlibrary.org/b/id/14847910-M.jpg',
  },
  {
    id: 'atlas-shrugged',
    title: 'Atlas Shrugged',
    author: 'Ayn Rand',
    spineColor: '#f4f4f5',
    textColor: '#1d2126',
    pages: 1184,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0679417397-M.jpg',
  },
  {
    id: 'the-black-swan',
    title: 'The Black Swan',
    author: 'Nassim Nicholas Taleb',
    spineColor: '#171717',
    textColor: '#f5f5f5',
    pages: 423,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0452284236-M.jpg',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    spineColor: '#4f3b2b',
    textColor: '#f9f2e8',
    pages: 273,
    coverSrc:
      'https://books.google.com/books/content?id=brSidvTKfcQC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'manufacturing-consent',
    title: 'Manufacturing Consent',
    author: 'Noam Chomsky',
    spineColor: '#7b1e1f',
    textColor: '#fff6f4',
    pages: 412,
    coverSrc: 'https://covers.openlibrary.org/b/id/7900362-M.jpg',
  },
  {
    id: 'the-society-of-the-spectacle',
    title: 'The Society of the Spectacle',
    author: 'Guy Debord',
    spineColor: '#2f3a56',
    textColor: '#eff3ff',
    pages: 192,
    coverSrc: 'https://covers.openlibrary.org/b/isbn/0934868077-M.jpg',
  },
  {
    id: 'the-brothers-karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    spineColor: '#1f2a29',
    textColor: '#eaf7f5',
    pages: 856,
    coverSrc:
      'https://books.google.com/books/content?id=VhfYK9jgYAYC&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'capitalist-realism',
    title: 'Capitalist Realism',
    author: 'Mark Fisher',
    spineColor: '#313131',
    textColor: '#f2f2f2',
    pages: 88,
    coverSrc:
      'https://books.google.com/books/content?id=QSiUEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'letters-to-a-young-poet',
    title: 'Letters to a Young Poet',
    author: 'Rainer Maria Rilke',
    spineColor: '#6e4a68',
    textColor: '#f7ecf6',
    pages: 104,
    coverSrc:
      'https://books.google.com/books/content?id=lwHgAgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=nocurl&source=gbs_api',
  },
  {
    id: 'critique-of-pure-reason',
    title: 'Critique of Pure Reason',
    author: 'Immanuel Kant',
    spineColor: '#27374d',
    textColor: '#f2f6fb',
    pages: 798,
    coverSrc: 'https://openroadmedia.com/ebook/the-critique-of-pure-reason/9781504004626',
  },
  {
    id: 'the-stranger',
    title: 'The Stranger',
    author: 'Albert Camus',
    spineColor: '#b73a2f',
    textColor: '#fff8ea',
    pages: 159,
    coverSrc:
      'https://upload.wikimedia.org/wikipedia/commons/9/97/L%27%C3%89tranger_-_Albert_Camus.jpg',
  },
  {
    id: 'anna-karenina',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    spineColor: '#2d3a2f',
    textColor: '#edf3ea',
    pages: 864,
    coverSrc: 'https://prodimage.images-bn.com/pimages/9780140449174_p0_v2_s600x595.jpg',
  },
]
