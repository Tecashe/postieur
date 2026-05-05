'use client'

import dynamic from 'next/dynamic'

const CanvasEditor = dynamic(() => import('@/components/design/canvas-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
      <div className="text-sm text-muted-foreground animate-pulse">Loading design tool…</div>
    </div>
  ),
})

export default function DesignPage() {
  return <CanvasEditor />
}
