import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from '@/lib/actions/templates'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const templates = await getTemplates()
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const template = await createTemplate(body)
  return NextResponse.json({ template }, { status: 201 })
}
