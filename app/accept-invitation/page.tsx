'use client'

import { Suspense, useEffect } from 'react'
import { useUser, useOrganizationList, SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Users, BarChart2, Calendar, Zap } from 'lucide-react'

// Always light — these match the vellum design token values exactly
const BG       = 'oklch(0.972 0.010 78)'   // --background light
const CARD     = 'oklch(0.981 0.007 75)'   // --card light
const FG       = 'oklch(0.160 0.018 48)'   // --foreground light
const FG_MUTED = 'oklch(0.45 0.025 48)'    // --muted-foreground light
const PRIMARY  = 'oklch(0.390 0.072 55)'   // --primary light (bronze)
const BORDER   = 'oklch(0.880 0.020 72)'   // --border light
const INPUT_BG = 'oklch(0.965 0.009 76)'   // --input light

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary:        PRIMARY,
    colorBackground:     CARD,
    colorText:           FG,
    colorTextSecondary:  FG_MUTED,
    colorInputBackground: INPUT_BG,
    colorInputText:      FG,
    colorNeutral:        FG_MUTED,
    borderRadius:        '0.375rem',
    fontFamily:          'inherit',
    fontSize:            '14px',
    spacingUnit:         '16px',
  },
  elements: {
    rootBox:          'w-full',
    card:             'shadow-none border-0 bg-transparent p-0',
    header:           'hidden',
    headerTitle:      'hidden',
    headerSubtitle:   'hidden',
    logoBox:          'hidden',
    socialButtonsBlockButton: `border bg-transparent hover:bg-[${BG}] transition-colors`,
    dividerRow:       'my-3',
    formButtonPrimary: `bg-[${PRIMARY}] text-[${CARD}] hover:opacity-90 transition-opacity font-medium tracking-wide`,
    footerActionLink:  `text-[${PRIMARY}] hover:opacity-80 font-medium`,
    formFieldInput:   `bg-[${INPUT_BG}] border-[${BORDER}] text-[${FG}] focus:ring-1 focus:ring-[${PRIMARY}]`,
    footerPages:      'hidden',
    footer:           `border-t border-[${BORDER}] mt-4 pt-4`,
  },
}

function Spinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: BG }}>
      <div className="w-10 h-10 rounded-sm overflow-hidden ring-1 shadow-sm mb-2"
        style={{ border: `1px solid ${BORDER}` }}>
        <Image src="/apple-touch-icon.png" alt="Caelpost" width={40} height={40} className="object-cover" />
      </div>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: PRIMARY }} />
      {message && <p className="text-sm" style={{ color: FG_MUTED }}>{message}</p>}
    </div>
  )
}

const FEATURES = [
  { icon: BarChart2, label: 'Analytics', desc: 'Track performance across all channels' },
  { icon: Calendar,  label: 'Scheduling', desc: 'Plan and queue posts in advance' },
  { icon: Users,     label: 'Collaboration', desc: 'Work together with your team' },
  { icon: Zap,       label: 'Automation', desc: 'Streamline your publishing workflow' },
]

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

  if (!isLoaded) return <Spinner />
  if (isSignedIn)  return <Spinner message="Joining your workspace…" />

  return (
    <div className="min-h-screen flex" style={{ background: BG, colorScheme: 'light' }}>

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden"
        style={{ background: `oklch(0.320 0.065 52)` }}>

        {/* Subtle noise / grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Top: logo + wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm overflow-hidden flex-shrink-0 ring-1 ring-white/20">
            <Image src="/apple-touch-icon.png" alt="Caelpost" width={36} height={36} className="object-cover" />
          </div>
          <span className="font-serif text-xl tracking-tight" style={{ color: 'oklch(0.965 0.008 75)' }}>
            Caelpost
          </span>
        </div>

        {/* Middle: headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4"
              style={{ color: 'oklch(0.75 0.06 62)' }}>
              You've been invited
            </p>
            <h2 className="font-serif text-3xl xl:text-4xl leading-[1.15] tracking-tight"
              style={{ color: 'oklch(0.965 0.008 75)' }}>
              Join your team&rsquo;s workspace
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'oklch(0.82 0.025 68)' }}>
              Sign in or create a free account to accept your invitation and start collaborating.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'oklch(0.42 0.07 54)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'oklch(0.88 0.04 68)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'oklch(0.93 0.010 75)' }}>{label}</p>
                  <p className="text-[11px]" style={{ color: 'oklch(0.72 0.025 65)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: footer note */}
        <p className="relative z-10 text-[11px]" style={{ color: 'oklch(0.58 0.030 58)' }}>
          © 2026 Caelpost. All rights reserved.
        </p>
      </div>

      {/* ── Right: auth panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-sm overflow-hidden ring-1" style={{ border: `1px solid ${BORDER}` }}>
            <Image src="/apple-touch-icon.png" alt="Caelpost" width={32} height={32} className="object-cover" />
          </div>
          <span className="font-serif text-lg tracking-tight" style={{ color: FG }}>Caelpost</span>
        </div>

        {/* Heading above the form */}
        <div className="w-full max-w-sm mb-8">
          <h1 className="font-serif text-2xl xl:text-3xl tracking-tight" style={{ color: FG }}>
            Accept your invitation
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: FG_MUTED }}>
            Sign in to your existing account or create a new one to join the workspace.
          </p>
        </div>

        {/* Clerk card — constrained width, no shadow/border since card is transparent */}
        <div className="w-full max-w-sm rounded-lg p-8 border shadow-sm"
          style={{ background: CARD, borderColor: BORDER }}>
          <SignIn
            routing="hash"
            forceRedirectUrl="/accept-invitation"
            fallbackRedirectUrl="/accept-invitation"
            signUpUrl="/accept-invitation#/sign-up"
            appearance={CLERK_APPEARANCE}
          />
        </div>

        <p className="mt-6 text-[11px] text-center" style={{ color: FG_MUTED }}>
          By continuing, you agree to Caelpost&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
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

