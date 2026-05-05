'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Bell, Globe, CreditCard, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney']

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-5 pb-6">
      <Tabs defaultValue="workspace">
        <TabsList className="bg-muted border border-border h-9 p-1 gap-0.5">
          {[['workspace','Workspace'], ['notifications','Notifications'], ['timezone','Date & Time'], ['billing','Billing']].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">{l}</TabsTrigger>
          ))}
        </TabsList>

        {/* Workspace */}
        <TabsContent value="workspace" className="mt-5 space-y-4">
          <Card className="bg-card border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Workspace Details</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Workspace Name</Label>
                <Input defaultValue="My Workspace" className="mt-1 h-8 text-xs bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs">Workspace URL</Label>
                <div className="flex gap-2 mt-1">
                  <span className="flex items-center text-xs text-muted-foreground bg-muted px-3 rounded-sm border border-border">caelpost.com/</span>
                  <Input defaultValue="my-workspace" className="flex-1 h-8 text-xs bg-input border-border" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input defaultValue="Social media management workspace" className="mt-1 h-8 text-xs bg-input border-border" />
              </div>
            </div>
            <Button size="sm" onClick={handleSave} className="text-xs gap-1.5">
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Changes'}
            </Button>
          </Card>

          <Card className="bg-destructive/5 border-destructive/20 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
            </div>
            <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data. This action cannot be undone.</p>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5">
              <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
            </Button>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-5">
          <Card className="bg-card border-border shadow-sm p-5 space-y-1">
            <h3 className="text-sm font-medium text-foreground mb-4">Notification Preferences</h3>
            {[
              ['Post Published', 'When a scheduled post goes live'],
              ['Post Failed', 'When a post fails to publish'],
              ['New Comment', 'When someone comments on your post'],
              ['New Mention', 'When your account is mentioned'],
              ['Weekly Report', 'Weekly analytics summary via email'],
              ['Team Activity', 'When team members make changes'],
              ['Queue Empty', 'When your posting queue runs low'],
            ].map(([label, desc]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
                <Switch defaultChecked className="scale-90" />
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Date & Time */}
        <TabsContent value="timezone" className="mt-5">
          <Card className="bg-card border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Date & Time</h3>
            <div>
              <Label className="text-xs">Timezone</Label>
              <select defaultValue="UTC" className="mt-1 w-full h-8 px-3 text-xs bg-input border border-border rounded-sm text-foreground outline-none focus:ring-1 focus:ring-ring">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date Format</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['MMM D, YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'].map(fmt => (
                  <button key={fmt} className="h-8 px-3 text-xs border border-border rounded-sm text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Week Starts On</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['Monday', 'Sunday'].map(day => (
                  <button key={day} className="h-8 px-3 text-xs border border-border rounded-sm text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all">
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" onClick={handleSave} className="text-xs gap-1.5">
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Changes'}
            </Button>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-5 space-y-4">
          <Card className="bg-primary/5 border-primary/20 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Current Plan</p>
                <p className="text-xl font-light text-foreground mt-0.5">Pro Plan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-primary">$49</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['25', 'Channels'], ['Unlimited', 'Posts/mo'], ['5', 'Team seats']].map(([v, l]) => (
                <div key={l} className="bg-card rounded-sm p-2 text-center">
                  <p className="text-sm font-medium text-foreground">{v}</p>
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs border-primary/30 text-primary hover:bg-primary/5">Upgrade to Agency</Button>
          </Card>
          <Card className="bg-card border-border shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Payment Method</h3>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-muted rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-foreground">VISA</span>
                </div>
                <div>
                  <p className="text-xs text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-[10px] text-muted-foreground">Expires 12/26</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">Change</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
