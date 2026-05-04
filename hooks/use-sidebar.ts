'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function useSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCollapsed = searchParams.get('sidebar') === 'collapsed'

  const toggle = () => {
    const params = new URLSearchParams(searchParams)
    if (isCollapsed) {
      params.delete('sidebar')
    } else {
      params.set('sidebar', 'collapsed')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return { isCollapsed, toggle }
}
