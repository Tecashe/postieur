import { NextRequest, NextResponse } from 'next/server'
import { disconnectChannel } from '@/lib/actions/channels'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await disconnectChannel(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect channel' }, { status: 500 })
  }
}
