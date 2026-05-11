import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
])

// These routes must remain public — th
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
    // Skip Next.js internals, static files, and OAuth callback routes
    // OAuth callbacks must NOT go through Clerk — session-sync redirects would
    // cause the browser to replay the callback URL, consuming the one-time code
    '/((?!_next|api/auth/[^/?]+/callback|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API routes — exclude OAuth callbacks (already covered above, belt-and-suspenders)
    '/(api(?!/auth/[^/]+/callback)|trpc)(.*)',
  ],
}
