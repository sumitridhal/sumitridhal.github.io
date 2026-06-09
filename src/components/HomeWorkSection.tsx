import { HomeWorkPicker } from '@/components/HomeWorkPicker'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
export function HomeWorkSection() {
  return (
    <HomeSlideLayout
      titleId="work-heading"
      eyebrow="Selected work"
      title="Product systems with a visible craft layer"
      lead="A compact deck of interface systems, cash movement flows, and governance work built for real operational constraints."
      className="work-slide"
    >
      <div className="work" aria-labelledby="work-heading">
        <HomeWorkPicker />
      </div>
    </HomeSlideLayout>
  )
}
