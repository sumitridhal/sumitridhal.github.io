const SCROLL_ITEMS = [
  {
    src: 'https://objectandarchive.com/cdn/shop/files/oa-custom-5.png?v=1776609699&width=900',
    title: 'Chatter over the new heir',
    credit: 'LaVerne Nelson Black',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/indianer_du_nord.png?v=1775327543&width=900',
    title: 'Indianer zu Pferd',
    credit: 'August Macke',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_of_confusion_22dd0388-3c82-47b3-a8cc-d33b535c249b.png?v=1775328526&width=900',
    title: 'The man of confusion',
    credit: 'Paul Klee',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/man_s_face.png?v=1775328340&width=900',
    title: "Man's face",
    credit: '',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/6715a96f-a601-4e5c-a51e-700c018d4870.png?v=1773532575&width=900',
    title: 'Still life',
    credit: '',
  },
  {
    src: 'https://objectandarchive.com/cdn/shop/files/september_moonrise_377c7870-65ef-4f06-9e85-a9e914f7fa72.png?v=1775328232&width=900',
    title: 'September moonrise',
    credit: '',
  },
] as const

export function WritingObjectArchiveScrollPreview() {
  return (
    <figure className="writing-oa-scroll" aria-label="Tween concept Part 3: static obsessions header and horizontal scroll strip">
      <figcaption className="writing-oa-scroll__caption">
        **Tween sheet — Part 3:** top block is **static** (typography + CTA). Below, the **scroll target** is a native
        horizontal strip of framed CDN tiles—drag, trackpad, or shift-wheel to move <code>scrollLeft</code>.
      </figcaption>

      <div className="writing-oa-scroll__stage">
        <header className="writing-oa-scroll__intro" aria-labelledby="writing-oa-scroll-heading">
          <div className="writing-oa-scroll__intro-text">
            <h2 id="writing-oa-scroll-heading" className="writing-oa-scroll__heading">
              Current obsessions
            </h2>
            <p className="writing-oa-scroll__lede">
              These are the works we keep coming back to right now. If you don&apos;t know where to start, start here.
            </p>
          </div>
          <a className="writing-oa-scroll__cta" href="https://objectandarchive.com/collections/all" rel="noreferrer noopener">
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
                  <img src={item.src} alt="" loading="lazy" decoding="async" />
                </div>
                <p className="writing-oa-scroll__tile-title">{item.title}</p>
                {item.credit ? <p className="writing-oa-scroll__tile-credit">{item.credit}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="writing-oa-scroll__hint">
        No GSAP here: the tween is the browser interpolating <code>scrollLeft</code> while you scroll. Snap is off so
        motion stays continuous.
      </p>
    </figure>
  )
}
