'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const mockups = [
  {
    title: 'Dashboard Overview',
    description: 'Real-time insights at a glance',
    feature: 'See all your metrics in one beautiful dashboard',
    grid: '01',
  },
  {
    title: 'Calendar Planning',
    description: 'Visualize your entire strategy',
    feature: 'Drag and drop to reschedule posts instantly',
    grid: '02',
  },
  {
    title: 'Content Creation',
    description: 'Create and schedule everything',
    feature: 'Multi-platform editing with platform-specific limits',
    grid: '03',
  },
  {
    title: 'Analytics Deep Dive',
    description: 'Understand performance trends',
    feature: 'Comparative metrics and growth predictions',
    grid: '04',
  },
]

export function InterfaceShowcase() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-zinc-900 dark:text-white mb-4">
            Powerful interface, thoughtful design
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Every pixel purposeful. Every interaction intentional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockups.map((mockup, idx) => (
            <motion.div
              key={mockup.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 h-full">
                {/* Mockup area - with gradient placeholder */}
                <div className="h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-serif font-light text-zinc-400 dark:text-zinc-600 mb-2">
                        {mockup.grid}
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-500 text-sm">Interface Preview</p>
                    </div>
                  </div>
                  
                  {/* Decorative grid pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-4 left-4 w-16 h-16 bg-white dark:bg-zinc-700 rounded-lg opacity-20"
                  />
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-4 right-4 w-12 h-12 bg-emerald-500 rounded opacity-20"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {mockup.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {mockup.description}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-0">
                    {mockup.feature}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
