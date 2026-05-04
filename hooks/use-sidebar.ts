'use client'

import { useState, useEffect } from 'react'

const SIDEBAR_KEY = 'sidebar_collapsed'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored === 'true') setIsCollapsed(true)
  }, [])

  const toggle = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }

  return { isCollapsed, toggle }
}
