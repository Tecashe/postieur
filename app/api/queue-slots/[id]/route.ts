import { NextResponse } from 'next/server'
import { updateQueueSlot, deleteQueueSlot } from '@/lib/actions/queue-slots'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const slot = await updateQueueSlot(id, data)
  return NextResponse.json({ slot })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteQueueSlot(id)
  return NextResponse.json({ success: true })
}
