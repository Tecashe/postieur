import { DashboardShell } from '@/components/layout/dashboard-shell'
import { provisionWorkspace } from '@/lib/provision-workspace'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure the workspace row exists for the active Clerk org on every render.
  // This is a no-op if the workspace already exists.
  await provisionWorkspace()

  return <DashboardShell>{children}</DashboardShell>
}
