'use client'

import { motion } from 'framer-motion'
import { PLATFORMS } from '@/lib/constants'

export function Platforms() {
  const platformList = Object.entries(PLATFORMS).slice(0, 8)

  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light mb-4 text-zinc-900 dark:text-white">
            All your platforms
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Connect once. Schedule everywhere.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        >
          {platformList.map(([key, platform]) => {
            const Icon = platform.icon
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
              >
                <Icon className="w-8 h-8 text-zinc-900 dark:text-white mb-3" />
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{platform.label}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-sm text-zinc-600 dark:text-zinc-400"
        >
          More integrations coming soon. Let us know what you need.
        </motion.p>
      </div>
    </section>
  )
}
