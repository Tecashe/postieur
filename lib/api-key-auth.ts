import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const bytes = crypto.randomBytes(32).toString('hex')
  const raw = `cael_live_${bytes}`
  const prefix = `cael_live_${bytes.slice(0, 8)}...`
  const hash = hashApiKey(raw)
  return { raw, prefix, hash }
}

/** Verify a Bearer token from request headers. Returns the workspaceId if valid, null otherwise. */
export async function verifyApiKey(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const raw = authHeader.slice(7).trim()
  if (!raw.startsWith('cael_live_')) return null

  const hash = hashApiKey(raw)
  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    select: { workspaceId: true, status: true },
  })

  if (!key || key.status !== 'ACTIVE') return null

  // Update lastUsedAt without blocking the response
  prisma.apiKey.update({ where: { keyHash: hash }, data: { lastUsedAt: new Date() } }).catch(() => {})

  return key.workspaceId
}
