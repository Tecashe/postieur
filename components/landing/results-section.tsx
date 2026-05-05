'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { TrendingUp, Clock, Users, Zap } from 'lucide-react'

const results = [
  {
    icon: TrendingUp,
    metric: '3.5x',
    label: 'Faster content creation',
    detail: 'Reduce posting time from hours to minutes',
    color: 'emerald',
  },
  {
    icon: Clock,
    metric: '10+ hrs',
    label: 'Saved per week',
    detail: 'Automated scheduling across platforms',
    color: 'blue',
  },
  {
    icon: Users,
    metric: '100%',
    label: 'Team alignment',
    detail: 'Clear approval workflows and permissions',
    color: 'purple',
  },
  {
    icon: Zap,
    metric: '40%',
    label: 'More engagement',
    detail: 'AI-optimized posting times and content',
    color: 'orange',
  },
]

const colorMap = {
  emerald: 'from-emerald-50 dark:from-emerald-950 to-emerald-100 dark:to-emerald-900',
  blue: 'from-blue-50 dark:from-blue-950 to-blue-100 dark:to-blue-900',
  purple: 'from-purple-50 dark:from-purple-950 to-purple-100 dark:to-purple-900',
  orange: 'from-orange-50 dark:from-orange-950 to-orange-100 dark:to-orange-900',
}

export function ResultsSection() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-zinc-900 dark:text-white mb-4">
            Real results from real creators
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            See what our users are achieving every day
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((result, idx) => {
            const Icon = result.icon
            const bgColor = colorMap[result.color as keyof typeof colorMap]
            
            return (
              <motion.div
                key={result.metric}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`p-8 h-full border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${bgColor}`}>
                  <Icon className="w-8 h-8 text-zinc-900 dark:text-white mb-4" />
                  <div className="text-4xl font-serif font-light text-zinc-900 dark:text-white mb-2">
                    {result.metric}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                    {result.label}
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {result.detail}
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
