import { useCallback } from 'react'
import {
  useNavigate,
  type NavigateOptions,
  type To,
} from 'react-router-dom'

import { startViewTransition } from '@/utils/viewTransitions'

export function useViewTransitionNavigate(): (
  to: To,
  options?: NavigateOptions,
) => void {
  const navigate = useNavigate()

  return useCallback(
    (to: To, options?: NavigateOptions) => {
      startViewTransition(() => {
        navigate(to, options)
      })
    },
    [navigate],
  )
}
