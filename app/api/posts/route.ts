import { NextRequest, NextResponse } from 'next/server'
import { getPosts } from '@/lib/actions/posts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | null
  const limit = parseInt(searchParams.get('limit') ?? '50')

  try {
    const posts = await getPosts({ status: status ?? undefined, limit })
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json([])
  }
}
