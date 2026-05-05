'use client'

import { useEffect } from 'react'
import { useUser, useOrganizationList } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

const BG      = 'oklch(0.972 0.010 78)'
const PRIMARY = 'oklch(0.390 0.072 55)'
const MUTED   = 'oklch(0.45 0.025 48)'
const BORDER  = 'oklch(0.880 0.020 72)'

export default function ChooseOrganizationPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { userMemberships, userInvitations, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
    userInvitations: { infinite: true },
  })

  useEffect(() => {
    if (!isLoaded) return

    // Not signed in → send to sign-in
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    // Wait for both lists to finish loading
    if (userMemberships?.isLoading !== false) return
    if (userInvitations?.isLoading !== false) return

    const run = async () => {
      const pending     = userInvitations?.data   ?? []
      const memberships = userMemberships?.data   ?? []

      // 1. Accept all pending invitations
      for (const inv of pending) {
        try { await inv.accept() } catch {}
      }

      // 2. Activate the invited org (first invitation) if any
      if (pending.length > 0) {
        try {
          await setActive?.({ organization: pending[0].publicOrganizationData.id })
          router.replace('/dashboard')
          return
        } catch {}
      }

      // 3. Activate existing membership if user already belongs to an org
      if (memberships.length > 0) {
        try {
          await setActive?.({ organization: memberships[0].organization.id })
          router.replace('/dashboard')
          return
        } catch {}
      }

      // 4. Truly no org → create one via onboarding
      router.replace('/onboarding')
    }

    run()
  }, [isLoaded, isSignedIn, userMemberships?.isLoading, userInvitations?.isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: BG, colorScheme: 'light' }}
    >
      <div
        className="w-10 h-10 rounded-sm overflow-hidden shadow-sm mb-2"
        style={{ border: `1px solid ${BORDER}` }}
      >
        <Image src="/apple-touch-icon.png" alt="Caelpost" width={40} height={40} className="object-cover" />
      </div>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: PRIMARY }} />
      <p className="text-sm" style={{ color: MUTED }}>Setting up your workspace…</p>
    </div>
  )
}
