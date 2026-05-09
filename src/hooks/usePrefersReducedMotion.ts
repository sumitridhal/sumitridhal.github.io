import { getReducedMotionMediaQuery } from '@/utils/prefersReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(getReducedMotionMediaQuery())
}
