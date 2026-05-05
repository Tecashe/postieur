'use client'

import { Suspense, useEffect } from 'react'
import { useUser, useOrganizationList, SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: 'oklch(0.55 0.12 55)',
    colorBackground: 'oklch(0.972 0.010 78)',
    colorText: 'oklch(0.18 0.025 48)',
    colorTextSecondary: 'oklch(0.45 0.025 48)',
    colorInputBackground: 'oklch(0.972 0.010 78)',
    colorInputText: 'oklch(0.18 0.025 48)',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-cabinet)',
  },
  elements: {
    card: 'shadow-lg border border-border bg-card',
    headerTitle: 'font-display text-foreground',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
    footerActionLink: 'text-primary hover:text-primary/80',
  },
}

function Spinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="w-10 h-10 rounded-sm overflow-hidden ring-1 ring-border shadow-sm mb-2">
        <Image src="/apple-touch-icon.png" alt="Caelpost" width={40} height={40} className="object-cover" />
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

function AcceptInvitationContent() {
  const { isSignedIn, isLoaded } = useUser()
  const { userInvitations, setActive } = useOrganizationList({
    userInvitations: { infinite: true },
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (userInvitations?.isLoading !== false) return

    const pending = userInvitations?.data ?? []

    const run = async () => {
      for (const inv of pending) {
        try { await inv.accept() } catch {}
      }
      if (pending.length > 0) {
        try { await setActive?.({ organization: pending[0].publicOrganizationData.id }) } catch {}
      }
      router.replace('/dashboard')
    }

    run()
  }, [isLoaded, isSignedIn, userInvitations?.isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading Clerk SDK
  if (!isLoaded) return <Spinner />

  // Signed in — processing invitations
  if (isSignedIn) return <Spinner message="Joining your workspace…" />

  // Not signed in — show auth UI, Clerk auto-handles __clerk_ticket from URL
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="w-10 h-10 rounded-sm overflow-hidden mx-auto mb-4 ring-1 ring-border shadow-sm">
          <Image src="/apple-touch-icon.png" alt="Caelpost" width={40} height={40} className="object-cover" />
        </div>
        <h1 className="font-serif text-2xl text-foreground tracking-tight">You've been invited</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in or create an account to join your team workspace
        </p>
      </div>

      <SignIn
        routing="hash"
        forceRedirectUrl="/accept-invitation"
        fallbackRedirectUrl="/accept-invitation"
        signUpUrl="/accept-invitation#/sign-up"
        appearance={CLERK_APPEARANCE}
      />
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
