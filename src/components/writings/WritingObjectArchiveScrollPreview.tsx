import {
  OA_HERO_IMG_LEFT,
  OA_HERO_IMG_RIGHT,
  OA_HERO_LOGO_SVG,
} from '@/components/writings/writingObjectArchiveHeroCdn'

/** Curator’s picks carousel — titles, artists, and CDN URLs from live storefront markup. */
const SCROLL_ITEMS = [
  {
    src: 'https://objectandarchive.com/cdn/shop/files/oa-custom-5.png?v=1776609699&width=900',
    title: 'Chatter over the New Heir',
    credit: 'LaVerne Nelson Black',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/indianer_du_nord.png?v=1775327543&width=900',
    title: 'Indianer zu Pferd',
    credit: 'August Macke',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_of_confusion_22dd0388-3c82-47b3-a8cc-d33b535c249b.png?v=1775328526&width=900',
    title: 'The Man of Confusion',
    credit: 'Paul Klee',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_s_face.png?v=1775328340&width=900',
    title: "Man's Face",
    credit: 'Arnold Peter Weisz-Kubínčan',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/6715a96f-a601-4e5c-a51e-700c018d4870.png?v=1773532575&width=900',
    title: 'Nocturne',
    credit: 'Childe Hassam',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/september_moonrise_377c7870-65ef-4f06-9e85-a9e914f7fa72.png?v=1775328232&width=900',
    title: 'September Moonrise',
    credit: 'Childe Hassam',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/figures.png?v=1775327811&width=900',
    title: 'Figures',
    credit: 'Jankel Adler',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/two-nudes_99aebea8-e2f2-4441-bac9-0cec70408f4b.png?v=1775328415&width=900',
    title: 'Two Nudes in a Room',
    credit: 'Ernst Ludwig Kirchner',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/flemish-verdure.png?v=1775328708&width=900',
    title: 'Verdure  - Flemish School (17th century)',
    credit: 'Unknown Artist',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/Baigneuses_sur_la_Rance_eb2f9f73-1402-413b-9a1c-4f1f6b2994f1.png?v=1775329598&width=900',
    title: 'Baigneuses sur la Rance',
    credit: 'Émile Othon Friesz',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/paysage_en_provence.png?v=1775330102&width=900',
    title: 'Paysage en Provence',
    credit: 'Émile Othon Friesz',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/Masseida_nue_allongee_sur_un_divan_b0ab1bc2-2c10-4b4e-acfc-f86bbe542236.png?v=1775329916&width=900',
    title: 'Masseïda nue allongée sur un divan',
    credit: 'Théophile Alexandre Steinlen',
  },
] as const

export function WritingObjectArchiveScrollPreview() {
  return (
    <figure
      className="writing-oa-scroll"
      aria-label="Tween concept Part 3: static Part 1 hero split, then obsessions band and horizontal scroll strip"
    >
      <figcaption className="writing-oa-scroll__caption">
        **Tween sheet — Part 3:** **(1)** Static **Part 1 hero**—same split media and wordmark stack as the curtain embed,
        with the curtain omitted (final layout only). **(2)** **Current obsessions** band + native horizontal{' '}
        <code>scrollLeft</code> strip of curator picks.
      </figcaption>

      <div className="writing-oa-scroll__shell">
        <div className="writing-oa-scroll__hero-static" aria-hidden="true">
          <div className="writing-oa-hero__stage">
            <div className="writing-oa-hero__split">
              <div className="writing-oa-hero__half writing-oa-hero__half--left">
                <img src={OA_HERO_IMG_LEFT} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="writing-oa-hero__half writing-oa-hero__half--right">
                <img src={OA_HERO_IMG_RIGHT} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
            <div className="writing-oa-hero__logo">
              <span className="writing-oa-hero__logo-scrim" aria-hidden="true" />
              <img src={OA_HERO_LOGO_SVG} alt="Object & Archive" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

        <div className="writing-oa-scroll__obsessions">
          <header className="writing-oa-scroll__intro" aria-labelledby="writing-oa-scroll-heading">
            <div className="writing-oa-scroll__intro-text">
              <h2 id="writing-oa-scroll-heading" className="writing-oa-scroll__heading">
                Current obsessions
              </h2>
              <p className="writing-oa-scroll__lede">
                These are the works we keep coming back to right now. If you don&apos;t know where to start, start here.
              </p>
            </div>
            <a
              className="writing-oa-scroll__cta"
              href="https://objectandarchive.com/collections/all"
              rel="noreferrer noopener"
            >
              See the collection
            </a>
          </header>

          <div
            className="writing-oa-scroll__viewport"
            tabIndex={0}
            role="region"
            aria-label="Horizontally scrollable obsession picks from Object and Archive"
          >
            <ul className="writing-oa-scroll__strip">
              {SCROLL_ITEMS.map((item) => (
                <li key={item.src} className="writing-oa-scroll__tile">
                  <div className="writing-oa-scroll__frame">
                    <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
                  </div>
                  <p className="writing-oa-scroll__tile-title">{item.title}</p>
                  {item.credit ? <p className="writing-oa-scroll__tile-credit">{item.credit}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="writing-oa-scroll__hint">
        Block 1 is motionless (same markup classes as Part 1 hero). Block 2 only tweens via native{' '}
        <code>scrollLeft</code>. Snap stays off.
      </p>
    </figure>
  )
}
