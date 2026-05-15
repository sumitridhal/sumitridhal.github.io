import type { HomeThemeId } from '@/utils/homeTheme'

export const HOME_SECTION_BANNERS = {
  experiments:
    'https://objectandarchive.com/cdn/shop/files/firmament-banner.png?v=1775309298&width=1200',
  writings:
    'https://objectandarchive.com/cdn/shop/files/bottom-banner2.jpg?v=1774725463&width=2000',
  books:
    'https://objectandarchive.com/cdn/shop/files/unexpected_red_theory_banner.png?v=1775310704&width=1800',
} as const

export type HomeBannerSectionId = keyof typeof HOME_SECTION_BANNERS

export function getHomeSectionBanner(theme: HomeThemeId): string | undefined {
  if (theme in HOME_SECTION_BANNERS) {
    return HOME_SECTION_BANNERS[theme as HomeBannerSectionId]
  }
  return undefined
}

export const HOME_BANNER_URLS = Object.values(HOME_SECTION_BANNERS)
