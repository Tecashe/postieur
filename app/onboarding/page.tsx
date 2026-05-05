'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationList } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const { createOrganization, setActive } = useOrganizationList()
  const [workspaceName, setWorkspaceName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceName.trim() || !createOrganization) return

    setIsLoading(true)
    setError(null)

    try {
      const org = await createOrganization({ name: workspaceName.trim() })
      if (setActive) {
        await setActive({ organization: org })
      }
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to create workspace:', err)
      setError('Failed to create workspace. Please try again.')
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
                <p className="text-sm text-destructive">{error}</p>
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
