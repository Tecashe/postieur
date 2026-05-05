import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PLATFORM_GUIDANCE: Record<string, string> = {
  x:         'Twitter/X: punchy, under 280 chars, hook in first line, max 2-3 hashtags',
  linkedin:  'LinkedIn: professional, value-first, 3 short paragraphs, 3-5 hashtags, ends with CTA',
  instagram: 'Instagram: story-driven, emoji-friendly, 5-10 hashtags at end, conversational',
  facebook:  'Facebook: casual, relatable, encourage comments/shares, 1-2 hashtags',
  threads:   'Threads: casual like Twitter, concise, conversational',
  bluesky:   'Bluesky: similar to Twitter, under 300 chars',
  tiktok:    'TikTok caption: very short, hooks the viewer, 3-5 relevant hashtags',
  default:   'Engaging social media post',
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const body = await req.json() as {
    action: 'improve' | 'hashtags' | 'variants' | 'thread'
    content: string
    platform?: string
    tone?: string
  }

  const { action, content, platform = 'default', tone = 'professional' } = body

  if (!content || content.trim().length < 3) {
    return NextResponse.json({ error: 'Content too short' }, { status: 400 })
  }

  const platformGuide = PLATFORM_GUIDANCE[platform] ?? PLATFORM_GUIDANCE.default

  let prompt = ''
  let maxTokens = 400

  switch (action) {
    case 'improve':
      prompt = `You are a social media copywriter. Improve this post for ${platform}.
Platform guidance: ${platformGuide}
Tone: ${tone}
Original: "${content}"
Return ONLY the improved post text, no explanation, no quotes.`
      break

    case 'hashtags':
      prompt = `Generate 8–12 relevant hashtags for this ${platform} post.
Post: "${content}"
Return ONLY the hashtags separated by spaces, no explanation.`
      maxTokens = 150
      break

    case 'variants':
      prompt = `Write 3 different versions of this post for ${platform}.
Platform guidance: ${platformGuide}
Tone: ${tone}
Original: "${content}"
Format your response as:
1. [first variant]
2. [second variant]
3. [third variant]`
      maxTokens = 600
      break

    case 'thread':
      prompt = `Convert this content into a 3-5 tweet thread for Twitter/X.
Each tweet must be under 270 characters.
Content: "${content}"
Format as:
1/n [first tweet]
2/n [second tweet]
...`
      maxTokens = 500
      break

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const model = 'gpt-4o-mini'
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  })

  const result = response.choices[0]?.message?.content?.trim() ?? ''
  const usage = response.usage

  // Log AI usage (non-blocking)
  prisma.aIUsageLog.create({
    data: {
      workspaceId: workspace.id,
      userId,
      feature: `compose_${action}`,
      model,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      cost: ((usage?.prompt_tokens ?? 0) * 0.00000015) + ((usage?.completion_tokens ?? 0) * 0.0000006),
    },
  }).catch(console.error)

  return NextResponse.json({ result })
}
