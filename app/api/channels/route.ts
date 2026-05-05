import { NextResponse } from 'next/server'
import { getChannels } from '@/lib/actions/channels'

export async function GET() {
  try {
    const channels = await getChannels()
    return NextResponse.json(channels)
  } catch {
    return NextResponse.json([])
  }
}
