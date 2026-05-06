/**
 * POST /api/channels/connect/telegram
 *
 * Telegram uses bot tokens from BotFather — NOT standard OAuth2.
 * Users provide their bot token and the chat ID (channel username or numeric ID).
 *
 * Body: { botToken: string, chatId: string }
 * Auth: Clerk session (workspaceId derived from orgId)
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const body = await req.json() as { botToken?: string; chatId?: string }
  const { botToken, chatId } = body

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'botToken and chatId are required' }, { status: 400 })
  }

  // Validate bot token and get bot info
  const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Invalid bot token' }, { status: 401 })
  }
  const meData = await meRes.json() as { ok: boolean; result?: { username?: string; first_name?: string; id?: number } }
  if (!meData.ok || !meData.result) {
    return NextResponse.json({ error: 'Invalid bot token' }, { status: 401 })
  }

  const botUsername = meData.result.username ?? `bot_${meData.result.id}`
  const botName = meData.result.first_name ?? botUsername

  // Validate that the bot can access the target chat
  const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId }),
  })

  let chatTitle = chatId
  let memberCount = 0
  if (chatRes.ok) {
    const chatData = await chatRes.json() as { ok: boolean; result?: { title?: string; username?: string } }
    chatTitle = chatData.result?.title ?? chatData.result?.username ?? chatId
    // Get member count for channels/groups
    const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    })
    if (countRes.ok) {
      const countData = await countRes.json() as { ok: boolean; result?: number }
      memberCount = countData.result ?? 0
    }
  } else {
    // Bot may not be in the chat — warn but don't fail (user can add bot after)
    console.warn('[telegram/connect] Could not verify chat access. Bot may not be a member yet.')
  }

  const handle = `@${botUsername}/${String(chatId).replace(/^@/, '')}`

  await prisma.channel.upsert({
    where: {
      workspaceId_platform_handle: {
        workspaceId: workspace.id,
        platform: 'telegram',
        handle,
      },
    },
    update: {
      accessToken: botToken,
      refreshToken: null,
      tokenExpiry: null, // Bot tokens don't expire
      displayName: chatTitle,
      avatarUrl: null,
      followers: memberCount,
      isActive: true,
      config: { chatId, botUsername, chatTitle },
    },
    create: {
      workspaceId: workspace.id,
      platform: 'telegram',
      handle,
      displayName: chatTitle,
      avatarUrl: null,
      accessToken: botToken,
      refreshToken: null,
      tokenExpiry: null,
      followers: memberCount,
      isActive: true,
      config: { chatId, botUsername, chatTitle },
    },
  })

  return NextResponse.json({ connected: true, handle, chatTitle })
}
