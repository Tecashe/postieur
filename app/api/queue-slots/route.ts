import { NextResponse } from 'next/server'
import { getQueueSlots, createQueueSlot } from '@/lib/actions/queue-slots'

export async function GET() {
  const slots = await getQueueSlots()
  return NextResponse.json({ slots })
}

export async function POST(request: Request) {
  const data = await request.json()
  const slot = await createQueueSlot(data)
  return NextResponse.json({ slot })
}
