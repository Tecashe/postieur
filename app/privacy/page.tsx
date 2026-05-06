import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Caelpost',
  description: 'How Caelpost collects, uses, and protects your personal data.',
}

const EFFECTIVE_DATE = 'May 6, 2026'
const COMPANY = 'Caelpost'
const CONTACT_EMAIL = 'privacy@caelpost.com'
const APP_URL = 'https://caelpost.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground/90 hover:text-foreground transition-colors">
            ← {COMPANY}
          </Link>
          <span className="text-xs text-muted-foreground">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Title */}
        <div className="space-y-3 border-b border-border pb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective date: <time dateTime="2026-05-06">{EFFECTIVE_DATE}</time>
          </p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates{' '}
            <a href={APP_URL} className="text-accent underline underline-offset-2 hover:opacity-80">{APP_URL}</a>.
            This policy describes what personal data we collect, why we collect it, how we use it,
            and your rights over it. We keep this plain and specific — no boilerplate walls of text.
          </p>
        </div>

        <Section id="data-we-collect" title="1. Data We Collect">
          <SubSection title="Account & Identity">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Name, email address, and profile photo — provided when you sign up via Clerk.</li>
              <li>Organisation name and team member emails if you create a workspace.</li>
              <li>Authentication tokens (access & refresh) for social platforms you connect.</li>
            </ul>
          </SubSection>
          <SubSection title="Content You Create">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Post drafts, captions, scheduled dates, and platform-specific overrides.</li>
              <li>Media files (images, videos) you upload — stored in Vercel Blob Storage.</li>
              <li>Templates, queue settings, and calendar preferences.</li>
            </ul>
          </SubSection>
          <SubSection title="Social Platform Data">
            <p className="text-sm text-muted-foreground">
              When you connect a social account (Instagram, X, LinkedIn, etc.) we receive and store
              only what is needed to publish on your behalf:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground mt-2">
              <li>Account handle, display name, avatar URL, and follower count.</li>
              <li>OAuth access tokens and (where applicable) refresh tokens. These are encrypted at rest in our database.</li>
              <li>Published post IDs returned by the platform after a successful publish.</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              We do <strong>not</strong> read your social media inboxes, followers lists, or any content
              beyond what is explicitly required for scheduling and publishing.
            </p>
          </SubSection>
          <SubSection title="Usage & Telemetry">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Anonymous page views and feature interaction events via Vercel Analytics — no personally identifiable information is attached.</li>
              <li>Error and performance logs collected server-side. These include request paths and timestamps but not request bodies.</li>
              <li>IP address and user-agent string — logged by our infrastructure provider for security purposes and retained for 30 days.</li>
            </ul>
          </SubSection>
          <SubSection title="Billing">
            <p className="text-sm text-muted-foreground">
              Payment processing is handled entirely by Stripe. We never see or store your full card number.
              We store your Stripe Customer ID and subscription status to manage your plan.
            </p>
          </SubSection>
        </Section>

        <Section id="how-we-use" title="2. How We Use Your Data">
          <Table
            rows={[
              ['Providing the service', 'Scheduling and publishing posts to connected social accounts on your behalf.', 'Contract performance'],
              ['Authentication', 'Verifying your identity through Clerk on every request.', 'Contract performance'],
              ['Token refresh', 'Automatically refreshing expiring OAuth tokens so your connected accounts stay active.', 'Contract performance'],
              ['Notifications', 'Emailing you about publish failures, approaching token expiry, or account activity.', 'Legitimate interest'],
              ['Product improvement', 'Aggregated, anonymised analytics to understand which features are used.', 'Legitimate interest'],
              ['Security & abuse prevention', 'Detecting unusual access patterns, rate-limiting, and blocking malicious actors.', 'Legitimate interest / Legal obligation'],
              ['Legal compliance', 'Responding to lawful requests from regulators or courts.', 'Legal obligation'],
            ]}
          />
          <p className="text-sm text-muted-foreground mt-4">
            We do <strong>not</strong> sell, rent, or trade your personal data to third parties.
            We do <strong>not</strong> use your content to train AI/ML models.
          </p>
        </Section>

        <Section id="third-parties" title="3. Third-Party Services We Use">
          <Table
            rows={[
              ['Clerk', 'Authentication & session management', 'clerk.com/privacy'],
              ['Neon (PostgreSQL)', 'Database hosting — all data stored in US East', 'neon.tech/privacy'],
              ['Vercel', 'Hosting, edge functions, blob storage, analytics', 'vercel.com/legal/privacy-policy'],
              ['Stripe', 'Subscription billing', 'stripe.com/privacy'],
              ['Meta (Instagram, Facebook)', 'Publishing via Graph API', 'facebook.com/privacy'],
              ['X (Twitter)', 'Publishing via API v2', 'x.com/privacy'],
              ['LinkedIn, Reddit, YouTube, etc.', 'Publishing via respective APIs', 'Each platform\'s privacy policy applies'],
            ]}
          />
          <p className="text-sm text-muted-foreground mt-4">
            Each sub-processor is contractually required to protect data in accordance with applicable law.
            We perform due diligence before adding any new sub-processor.
          </p>
        </Section>

        <Section id="data-retention" title="4. Data Retention">
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li><strong>Active accounts:</strong> All data is retained while your account is active.</li>
            <li><strong>Deleted posts:</strong> Removed from our database within 30 days of deletion.</li>
            <li><strong>Disconnected channels:</strong> OAuth tokens are deleted immediately when you disconnect a channel. Profile metadata is removed within 7 days.</li>
            <li><strong>Closed accounts:</strong> All personal data is deleted within 30 days of account closure, except where we are required by law to retain it (e.g. billing records for 7 years in some jurisdictions).</li>
            <li><strong>Backups:</strong> Database backups are retained for up to 30 days, after which deleted data is fully purged.</li>
          </ul>
        </Section>

        <Section id="security" title="5. Security">
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>All data in transit is encrypted with TLS 1.2 or higher.</li>
            <li>OAuth tokens are stored encrypted at rest in our database.</li>
            <li>Access to production databases is restricted to authorised engineers only, over VPN, with MFA enforced.</li>
            <li>We use short-lived session tokens (managed by Clerk) and rotate OAuth tokens before expiry.</li>
            <li>Security incidents are disclosed to affected users within 72 hours of confirmation.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            If you discover a security vulnerability, please report it to{' '}
            <a href={`mailto:security@caelpost.com`} className="text-accent underline underline-offset-2">security@caelpost.com</a>.
            We do not take legal action against good-faith security researchers.
          </p>
        </Section>

        <Section id="your-rights" title="6. Your Rights">
          <p className="text-sm text-muted-foreground mb-4">
            Depending on your location you may have the following rights. To exercise any of them, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">{CONTACT_EMAIL}</a>.
            We respond within 30 days.
          </p>
          <Table
            rows={[
              ['Access', 'Request a copy of all personal data we hold about you.'],
              ['Rectification', 'Ask us to correct inaccurate or incomplete data.'],
              ['Erasure ("right to be forgotten")', 'Request deletion of your personal data.'],
              ['Portability', 'Receive your data in a structured, machine-readable format (JSON).'],
              ['Restriction', 'Ask us to restrict processing while a complaint is resolved.'],
              ['Object', 'Object to processing based on legitimate interests.'],
              ['Withdraw consent', 'Disconnect any social account at any time from the Channels page.'],
            ]}
          />
        </Section>

        <Section id="cookies" title="7. Cookies &amp; Local Storage">
          <Table
            rows={[
              ['__clerk_*', 'Session', 'Authentication state (set by Clerk, essential)'],
              ['pkce_verifier', 'Session (10 min)', 'Temporary OAuth PKCE code verifier — deleted after connect'],
              ['theme', 'Persistent', 'Your light/dark mode preference — stored locally, never sent to our servers'],
            ]}
          />
          <p className="text-sm text-muted-foreground mt-4">
            We do not use advertising cookies, fingerprinting, or cross-site tracking.
            Vercel Analytics uses no cookies — it is privacy-first and GDPR-compliant by design.
          </p>
        </Section>

        <Section id="children" title="8. Children">
          <p className="text-sm text-muted-foreground">
            {COMPANY} is not directed at children under 16. We do not knowingly collect personal data
            from anyone under 16. If you believe we have inadvertently collected data from a child,
            contact us immediately at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">{CONTACT_EMAIL}</a>{' '}
            and we will delete it promptly.
          </p>
        </Section>

        <Section id="international" title="9. International Transfers">
          <p className="text-sm text-muted-foreground">
            Our infrastructure is primarily located in the United States (Vercel, Neon). If you are
            located in the EU/EEA or UK, your data is transferred to the US under the EU-US Data
            Privacy Framework and Standard Contractual Clauses where applicable. We only use
            sub-processors who provide adequate data-transfer safeguards.
          </p>
        </Section>

        <Section id="changes" title="10. Changes to This Policy">
          <p className="text-sm text-muted-foreground">
            We may update this policy from time to time. For material changes we will notify you by
            email and/or a banner in the dashboard at least 14 days before the change takes effect.
            Continued use of {COMPANY} after that date constitutes acceptance of the updated policy.
            The current effective date is always shown at the top of this page.
          </p>
        </Section>

        <Section id="contact" title="11. Contact">
          <p className="text-sm text-muted-foreground">
            For privacy questions, data requests, or complaints:
          </p>
          <div className="mt-4 rounded-lg border border-border bg-muted/20 p-5 text-sm space-y-1">
            <p className="font-medium text-foreground">{COMPANY} Privacy Team</p>
            <p className="text-muted-foreground">
              Email:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">{CONTACT_EMAIL}</a>
            </p>
            <p className="text-muted-foreground">
              You also have the right to lodge a complaint with your local data protection authority
              (e.g. ICO in the UK, or your EU supervisory authority).
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Layout components ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {children}
    </div>
  )
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-muted/20' : 'bg-transparent'}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 align-top ${j === 0 ? 'font-medium text-foreground/90 whitespace-nowrap w-[200px]' : 'text-muted-foreground'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
