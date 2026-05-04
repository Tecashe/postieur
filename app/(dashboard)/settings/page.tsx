import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage workspace settings',
}

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Workspace Settings */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-4">Workspace Settings</h3>
        <Separator className="mb-6" />
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-zinc-900 dark:text-white">
              Workspace Name
            </Label>
            <Input
              id="name"
              defaultValue="Company Pro"
              className="mt-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="desc" className="text-sm font-medium text-zinc-900 dark:text-white">
              Description
            </Label>
            <Input
              id="desc"
              defaultValue="Social media management workspace"
              className="mt-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>
          <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">Save Changes</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-4">Notifications</h3>
        <Separator className="mb-6" />
        <div className="space-y-4">
          {[
            { label: 'Post published', desc: 'Get notified when a post goes live' },
            { label: 'New comments', desc: 'Receive alerts on new comments' },
            { label: 'Team invites', desc: 'Notifications for team member invitations' },
            { label: 'Scheduled reminders', desc: 'Get reminders for scheduled posts' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </Card>

      {/* Publishing */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-4">Publishing Settings</h3>
        <Separator className="mb-6" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Require approval</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Posts need admin approval before publishing</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Auto-scheduling</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Automatically schedule posts during business hours</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Draft retention</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Keep drafts for 30 days before archiving</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </Card>

      {/* Billing */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-4">Billing & Subscription</h3>
        <Separator className="mb-6" />
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Professional Plan</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">$99/month • Renews May 15, 2024</p>
            </div>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
              Manage
            </Button>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">Usage This Month</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
              <div className="bg-zinc-900 dark:bg-white h-2 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">65 of 100 posts used</p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
        <h3 className="text-lg font-light text-red-900 dark:text-red-100 mb-4">Danger Zone</h3>
        <Separator className="mb-6 bg-red-200 dark:bg-red-800" />
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Delete Workspace</p>
            <p className="text-xs text-red-700 dark:text-red-200 mb-4">
              Permanently delete this workspace and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              Delete Workspace
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
