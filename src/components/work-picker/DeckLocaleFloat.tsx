import type { LocaleFloatData } from '@/data/projectsData'

type DeckLocaleFloatProps = {
  data: LocaleFloatData
}

export function DeckLocaleFloat({ data }: DeckLocaleFloatProps) {
  return (
    <div className="work-picker__float-card work-picker__float-card--locale" aria-hidden>
      <span className="deck-float__pill">{data.pill}</span>
      <p className="deck-float__heading">{data.heading}</p>
      <div className="deck-float__orbit">
        <span className="deck-float__orbit-ring deck-float__orbit-ring--1" />
        <span className="deck-float__orbit-ring deck-float__orbit-ring--2" />
        <span className="deck-float__orbit-core">$</span>
        {data.markets.slice(0, 4).map((market, index) => (
          <span key={market} className="deck-float__chip" data-pos={index}>
            {market}
          </span>
        ))}
      </div>
      <p className="deck-float__caption">{data.caption}</p>
    </div>
  )
}
