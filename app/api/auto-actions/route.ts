import { NextResponse } from 'next/server'
import { getAutoActions, createAutoAction } from '@/lib/actions/auto-actions'

export async function GET() {
  const actions = await getAutoActions()
  return NextResponse.json({ actions })
}

export async function POST(request: Request) {
  const data = await request.json()
  const action = await createAutoAction(data)
  return NextResponse.json({ action })
}
