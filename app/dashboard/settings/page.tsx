'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Lock, Users, CreditCard, Trash2, Download } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your workspace and preferences</p>
      </div>

      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Workspace Settings */}
        <TabsContent value="workspace" className="space-y-6">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Workspace Information</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="workspace-name" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Workspace Name
                </Label>
                <Input
                  id="workspace-name"
                  defaultValue="Company Pro"
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="workspace-description" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Description
                </Label>
                <Textarea
                  id="workspace-description"
                  defaultValue="A premier social media management platform for brands"
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white min-h-24 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="workspace-url" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Workspace URL
                </Label>
                <Input
                  id="workspace-url"
                  defaultValue="https://app.social.com/company-pro"
                  disabled
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                />
              </div>

              <div>
                <Label htmlFor="workspace-timezone" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Timezone
                </Label>
                <select
                  id="workspace-timezone"
                  defaultValue="america/newyork"
                  className="mt-2 w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                >
                  <option value="america/newyork">Eastern Time (US & Canada)</option>
                  <option value="america/chicago">Central Time (US & Canada)</option>
                  <option value="america/denver">Mountain Time (US & Canada)</option>
                  <option value="america/losangeles">Pacific Time (US & Canada)</option>
                  <option value="europe/london">London</option>
                  <option value="europe/paris">Paris</option>
                </select>
              </div>

              <Button className="w-full sm:w-auto">Save Changes</Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 sm:p-6 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950">
            <h3 className="text-lg font-light text-red-900 dark:text-red-100 mb-4">Danger Zone</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              Deleting your workspace cannot be undone. All data will be permanently removed.
            </p>
            <Button variant="outline" className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Workspace
            </Button>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Post Published', description: 'When your posts go live', enabled: true },
                { label: 'Comments & Replies', description: 'New engagement on your posts', enabled: true },
                { label: 'Weekly Digest', description: 'Summary of performance metrics', enabled: true },
                { label: 'Team Mentions', description: 'When someone mentions you', enabled: false },
                { label: 'System Updates', description: 'Important product updates', enabled: true },
                { label: 'Account Changes', description: 'Login alerts and security notices', enabled: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Email Frequency</h3>
            <div className="space-y-3">
              {['Instantly', 'Daily Digest', 'Weekly Digest'].map((option) => (
                <label key={option} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <input type="radio" name="frequency" defaultChecked={option === 'Daily Digest'} className="w-4 h-4" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{option}</span>
                </label>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Current Plan</h3>
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Pro Plan</p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">Billed monthly • Renews May 15, 2024</p>
                </div>
                <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200">
                  Active
                </Badge>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <span className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">$49/month</span>
                <Button size="sm" variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Billing History</h3>
            <div className="space-y-2">
              {[
                { date: 'April 15, 2024', amount: '$49.00', status: 'Paid' },
                { date: 'March 15, 2024', amount: '$49.00', status: 'Paid' },
                { date: 'February 15, 2024', amount: '$49.00', status: 'Paid' },
                { date: 'January 15, 2024', amount: '$49.00', status: 'Paid' },
              ].map((invoice, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{invoice.date}</p>
                  </div>
                  <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">{invoice.status}</Badge>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white ml-4">{invoice.amount}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Password</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-sm font-medium text-zinc-900 dark:text-white">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-sm font-medium text-zinc-900 dark:text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="mt-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <Button className="w-full sm:w-auto">Update Password</Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Add an extra layer of security to your account with two-factor authentication
            </p>
            <Button>Enable 2FA</Button>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-6">Active Sessions</h3>
            <div className="space-y-3">
              {[
                { device: 'Chrome on macOS', location: 'San Francisco, CA', lastActive: 'Just now', current: true },
                { device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago' },
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{session.device}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {session.location} • Last active: {session.lastActive}
                    </p>
                  </div>
                  {session.current && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200">
                      Current
                    </Badge>
                  )}
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                      Sign Out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
