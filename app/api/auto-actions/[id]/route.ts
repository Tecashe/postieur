import { NextResponse } from 'next/server'
import { updateAutoAction, deleteAutoAction } from '@/lib/actions/auto-actions'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const action = await updateAutoAction(id, data)
  return NextResponse.json({ action })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteAutoAction(id)
  return NextResponse.json({ success: true })
}
