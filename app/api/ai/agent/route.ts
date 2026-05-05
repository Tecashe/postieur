import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a social media AI assistant for Postiz — a social media scheduling and analytics platform.
You can help users write, improve, and schedule social media posts across all connected platforms.

You have access to tools that let you:
- List connected channels (getChannels)
- Create and schedule posts (createPost)
- Get recent analytics (getAnalytics)

When a user asks you to schedule or post something, ALWAYS use the tools — don't just describe what you'd do.
When calling createPost, pick sensible defaults: if no date is given, schedule for tomorrow 9am UTC.
Keep responses concise and actionable. Use markdown formatting when helpful.`

// Tool definitions
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getChannels',
      description: 'Get a list of connected social media channels for this workspace',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createPost',
      description: 'Create and optionally schedule a social media post',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'The post text content' },
          channelIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of channel IDs to post to. Use getChannels first to retrieve IDs.',
          },
          scheduledAt: {
            type: 'string',
            description: 'ISO 8601 datetime to schedule the post. Omit to save as draft.',
          },
          type: {
            type: 'string',
            enum: ['POST', 'THREAD'],
            description: 'Post type — defaults to POST',
          },
        },
        required: ['content', 'channelIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAnalytics',
      description: 'Get aggregated analytics for the workspace (last 30 days)',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
]

// Tool handlers
async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  workspaceId: string,
  userId: string
): Promise<string> {
  if (name === 'getChannels') {
    const channels = await prisma.channel.findMany({
      where: { workspaceId, isActive: true },
      select: { id: true, platform: true, handle: true, displayName: true, followers: true },
    })
    return JSON.stringify(channels)
  }

  if (name === 'createPost') {
    const { content, channelIds, scheduledAt, type = 'POST' } = args as {
      content: string; channelIds: string[]; scheduledAt?: string; type?: string
    }
    // Validate channels belong to this workspace
    const validChannels = await prisma.channel.findMany({
      where: { id: { in: channelIds }, workspaceId, isActive: true },
      select: { id: true },
    })
    const validIds = validChannels.map(c => c.id)

    const post = await prisma.post.create({
      data: {
        workspaceId,
        content,
        type: type as 'POST' | 'THREAD',
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        mediaUrls: [],
        threadPosts: [],
        labels: [],
        crossPostDelayMinutes: 0,
        createdById: userId,
        channels: validIds.length > 0 ? {
          create: validIds.map(channelId => ({
            channelId,
            status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
          })),
        } : undefined,
      },
    })
    return JSON.stringify({
      success: true,
      postId: post.id,
      status: post.status,
      scheduledAt: post.scheduledAt,
      message: scheduledAt
        ? `Post scheduled for ${new Date(scheduledAt).toLocaleString()}`
        : 'Post saved as draft',
    })
  }

  if (name === 'getAnalytics') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000)
    const [totalPosts, scheduled, published, failed] = await Promise.all([
      prisma.post.count({ where: { workspaceId, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.post.count({ where: { workspaceId, status: 'SCHEDULED' } }),
      prisma.post.count({ where: { workspaceId, status: 'PUBLISHED', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.post.count({ where: { workspaceId, status: 'FAILED', createdAt: { gte: thirtyDaysAgo } } }),
    ])
    return JSON.stringify({ totalPosts, scheduled, published, failed, period: '30 days' })
  }

  return JSON.stringify({ error: 'Unknown tool' })
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
  }

  if (!messages?.length) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
  }

  const history = messages.slice(-20)

  // Agentic loop — up to 5 tool-call iterations
  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ]

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 800,
      temperature: 0.7,
    })

    const msg = response.choices[0]?.message
    if (!msg) break

    apiMessages.push(msg)

    // No tool calls — we have the final reply
    if (!msg.tool_calls?.length) {
      return NextResponse.json({ reply: msg.content ?? '' })
    }

    // Execute all tool calls
    for (const toolCall of msg.tool_calls) {
      let toolArgs: Record<string, unknown> = {}
      try { toolArgs = JSON.parse(toolCall.function.arguments) } catch {}
      const result = await handleToolCall(toolCall.function.name, toolArgs, workspace.id, userId)
      apiMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  // Fallback if loop exhausted
  const lastMsg = apiMessages[apiMessages.length - 1]
  const fallbackContent = typeof lastMsg?.content === 'string' ? lastMsg.content : 'Done.'
  return NextResponse.json({ reply: fallbackContent })
}
