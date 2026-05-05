'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

const steps = [
  {
    number: '01',
    title: 'Connect Your Accounts',
    description: 'Securely link all your social media profiles in minutes. We support every major platform.',
    color: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
  },
  {
    number: '02',
    title: 'Plan Your Content',
    description: 'Use our calendar to visualize your posting schedule. Drag and drop to reschedule instantly.',
    color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
  },
  {
    number: '03',
    title: 'Create & Schedule',
    description: 'Write, design, and schedule posts across all platforms simultaneously. Publish at optimal times.',
    color: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
  },
  {
    number: '04',
    title: 'Analyze Performance',
    description: 'Watch engagement roll in. Get real-time insights and AI recommendations for improvement.',
    color: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
  },
]

export function VisualWalkthrough() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-zinc-900 dark:text-white">
            How it works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-lg">
            Four simple steps to master your social media
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`p-6 h-full border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${step.color}`}>
                <div className="text-4xl font-serif font-light text-zinc-900 dark:text-white mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
