'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Calendar, BarChart3, Users, Sparkles, Shield, Zap, Lock, Lightbulb } from 'lucide-react'

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Post at peak times with AI-powered recommendations',
    icon: Calendar,
    span: 'col-span-1 row-span-1',
    color: 'from-emerald-50 dark:from-emerald-950 to-emerald-100 dark:to-emerald-900',
  },
  {
    title: 'Deep Analytics',
    description: 'Track every metric. Understand what resonates.',
    icon: BarChart3,
    span: 'col-span-1 row-span-1',
    color: 'from-blue-50 dark:from-blue-950 to-blue-100 dark:to-blue-900',
  },
  {
    title: 'Team Collaboration',
    description: 'Assign roles, approve content, ship together',
    icon: Users,
    span: 'col-span-2 md:col-span-1 row-span-1',
    color: 'from-purple-50 dark:from-purple-950 to-purple-100 dark:to-purple-900',
  },
  {
    title: 'AI Content Copilot',
    description: 'Generate captions, hashtags, and post ideas instantly',
    icon: Sparkles,
    span: 'col-span-2 md:col-span-1 row-span-1',
    color: 'from-orange-50 dark:from-orange-950 to-orange-100 dark:to-orange-900',
  },
  {
    title: 'Enterprise Security',
    description: 'SSO, 2FA, encrypted, SOC2 compliant',
    icon: Shield,
    span: 'col-span-1 row-span-1',
    color: 'from-red-50 dark:from-red-950 to-red-100 dark:to-red-900',
  },
  {
    title: 'Instant Publishing',
    description: 'Schedule once, publish everywhere automatically',
    icon: Zap,
    span: 'col-span-1 row-span-1',
    color: 'from-yellow-50 dark:from-yellow-950 to-yellow-100 dark:to-yellow-900',
  },
  {
    title: 'Content Vault',
    description: 'Organize, template, reuse your best creators work',
    icon: Lock,
    span: 'col-span-2 row-span-1',
    color: 'from-pink-50 dark:from-pink-950 to-pink-100 dark:to-pink-900',
  },
  {
    title: 'Smart Insights',
    description: 'Get actionable recommendations every week',
    icon: Lightbulb,
    span: 'col-span-1 md:col-span-2 row-span-1',
    color: 'from-cyan-50 dark:from-cyan-950 to-cyan-100 dark:to-cyan-900',
  },
]

export function BentoFeatures() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-zinc-900 dark:text-white mb-4">
            Everything you need
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl">
            Built from the ground up for creators and teams who demand more from their social media platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-max">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={feature.span}
              >
                <Card className={`p-6 h-full border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${feature.color} hover:shadow-lg transition-shadow`}>
                  <Icon className="w-6 h-6 text-zinc-900 dark:text-white mb-3" />
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
