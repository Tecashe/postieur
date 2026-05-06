import { NextResponse } from 'next/server'
import { getAutoActions, createAutoAction } from '@/lib/actions/auto-actions'
import type { AutoActionTrigger, AutoActionType, AutoAction } from '@prisma/client'

// Normalize DB records to the UI-expected shape
function normalize(a: AutoAction) {
  return {
    id: a.id,
    name: a.name,
    trigger: a.triggerType,           // UI reads .trigger
    action: a.actionType,             // UI reads .action
    triggerValue: a.triggerValue,
    isEnabled: a.isEnabled,
    metadata: (a.config ?? {}) as Record<string, unknown>, // UI reads .metadata
    executionCount: a.runCount ?? 0,
    createdAt: a.createdAt,
  }
}

export async function GET() {
  const actions = await getAutoActions()
  return NextResponse.json({ actions: actions.map(normalize) })
}

export async function POST(request: Request) {
  // Map UI field names → DB field names
  const body = await request.json() as {
    name: string
    trigger: string
    action: string
    triggerValue?: string
    isEnabled?: boolean
    metadata?: Record<string, unknown>
  }
  const action = await createAutoAction({
    name: body.name,
    triggerType: body.trigger as AutoActionTrigger,
    triggerValue: body.triggerValue,
    actionType: body.action as AutoActionType,
    config: body.metadata ?? {},
  })
  return NextResponse.json({ action: normalize(action) })
}
