import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
])

// These routes must remain public — they handle their own auth state
const isPublicRoute = createRouteMatcher([
  '/accept-invitation(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth/(.*)',   // OAuth callbacks — no session exists yet when Meta redirects back
  '/api/webhooks/(.*)',
  '/privacy(.*)',
  '/terms(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
