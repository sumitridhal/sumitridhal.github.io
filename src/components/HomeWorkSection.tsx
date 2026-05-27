import { HomeWorkPicker } from '@/components/HomeWorkPicker'
import { HomeSlideLayout } from '@/components/HomeSlideLayout'
export function HomeWorkSection() {
  return (
    <HomeSlideLayout titleId="work-heading" title="Selected projects" className="work-slide">
      <div className="work" aria-labelledby="work-heading">
        <HomeWorkPicker />
      </div>
    </HomeSlideLayout>
  )
}
