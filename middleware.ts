// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/onboarding(.*)',
// ])

// // These routes must remain public — they handle their own auth state
// const isPublicRoute = createRouteMatcher([
//   '/accept-invitation(.*)',
//   '/sign-in(.*)',
//   '/sign-up(.*)',
// ])

// export default clerkMiddleware(async (auth, req) => {
//   if (isPublicRoute(req)) return
//   if (isProtectedRoute(req)) {
//     await auth.protect()
//   }
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and static files
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
])

const isPublicRoute = createRouteMatcher([
  '/accept-invitation(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Hard bypass — return immediately, no Clerk processing at all
  if (req.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  if (isPublicRoute(req)) return
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, AND all OAuth routes
    '/((?!_next|api/auth|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API routes except /api/auth/*
    '/(api|trpc)((?!/auth/).*)',
  ],
}