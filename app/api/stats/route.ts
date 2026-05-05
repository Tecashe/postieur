import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/actions/posts'

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch {
    return NextResponse.json({ totalPosts: 0, scheduled: 0, published: 0, failed: 0 })
  }
}
