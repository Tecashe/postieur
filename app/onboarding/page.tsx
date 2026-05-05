'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrganizationList } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // ?new=true means an existing user explicitly wants a new workspace (not first-time setup)
  const isNewWorkspace = searchParams.get('new') === 'true'

  const { createOrganization, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const [workspaceName, setWorkspaceName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Skip onboarding only for first-time setup (not when explicitly creating a new workspace)
  useEffect(() => {
    if (isNewWorkspace) return
    if (userMemberships?.isLoading !== false) return
    if ((userMemberships?.data?.length ?? 0) > 0) {
      router.replace('/dashboard')
    }
  }, [isNewWorkspace, userMemberships?.isLoading, userMemberships?.data?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceName.trim() || !createOrganization) return

    setIsLoading(true)
    setError(null)

    try {
      const slug = workspaceName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48)
      const org = await createOrganization({ name: workspaceName.trim(), slug })
      if (setActive) {
        await setActive({ organization: org })
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      console.error('Failed to create workspace:', err)
      // Surface Clerk quota error gracefully
      const clerkErr = err as { errors?: { code: string; longMessage?: string }[] }
      const quotaErr = clerkErr?.errors?.find((e) => e.code === 'organization_membership_quota_exceeded')
      if (quotaErr) {
        setError('You\'ve reached your limit of 5 workspace memberships. Leave an existing workspace before creating a new one.')
      } else {
        setError('Failed to create workspace. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Caelpost
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Let&apos;s set up your workspace</p>
        </div>

        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-xl text-foreground">
              Create your workspace
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              A workspace is where you and your team manage all your social media channels and posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Workspace name
                </Label>
                <Input
                  id="name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp, My Brand"
                  className="bg-background border-border text-foreground"
                  required
                  minLength={2}
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  You can rename this later in settings.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-sm bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !workspaceName.trim()}
              >
                {isLoading ? 'Creating workspace…' : 'Create workspace'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can invite teammates after setup.
        </p>
      </div>
    </div>
  )
}
