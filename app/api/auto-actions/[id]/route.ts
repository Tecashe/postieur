import { NextResponse } from 'next/server'
import { updateAutoAction, deleteAutoAction } from '@/lib/actions/auto-actions'
import type { AutoActionTrigger, AutoActionType } from '@prisma/client'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json() as {
    name?: string
    isEnabled?: boolean
    trigger?: string
    action?: string
    triggerValue?: string
    metadata?: Record<string, unknown>
  }
  // Map UI names → DB names
  const update: Parameters<typeof updateAutoAction>[1] = {}
  if (body.name !== undefined) update.name = body.name
  if (body.isEnabled !== undefined) update.isEnabled = body.isEnabled
  if (body.trigger !== undefined) update.triggerType = body.trigger as AutoActionTrigger
  if (body.action !== undefined) update.actionType = body.action as AutoActionType
  if (body.triggerValue !== undefined) update.triggerValue = body.triggerValue
  if (body.metadata !== undefined) update.config = body.metadata
  const action = await updateAutoAction(id, update)
  return NextResponse.json({ action })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteAutoAction(id)
  return NextResponse.json({ success: true })
}
