import type { HomeThemeId } from '@/utils/homeTheme'

const EXPERIMENTS_SECTION_BANNER =
  'https://objectandarchive.com/cdn/shop/files/firmament-banner.png?v=1775309298&width=1800'

export const HOME_SECTION_BANNERS = {
  experiments: EXPERIMENTS_SECTION_BANNER,
  writings: EXPERIMENTS_SECTION_BANNER,
  books: EXPERIMENTS_SECTION_BANNER,
} as const

export type HomeBannerSectionId = keyof typeof HOME_SECTION_BANNERS

export function getHomeSectionBanner(theme: HomeThemeId): string | undefined {
  if (theme in HOME_SECTION_BANNERS) {
    return HOME_SECTION_BANNERS[theme as HomeBannerSectionId]
  }
  return undefined
}

export const HOME_BANNER_URLS = Object.values(HOME_SECTION_BANNERS)
