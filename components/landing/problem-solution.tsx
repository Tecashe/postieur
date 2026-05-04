'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

export function ProblemSolution() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Before */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-light mb-6 text-zinc-900 dark:text-white">
              The old way
            </h2>
            <div className="space-y-4">
              {[
                'Jumping between 5+ apps',
                'No idea what posts work best',
                'Missing optimal posting times',
                'Team chaos with no visibility',
                'Manually tracking analytics',
              ].map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-700 dark:text-zinc-300">{issue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-light mb-6 text-zinc-900 dark:text-white">
              The Schedulify way
            </h2>
            <div className="space-y-4">
              {[
                'One dashboard for all platforms',
                'AI-powered insights on every post',
                'Optimal times suggested automatically',
                'Collaborate effortlessly with teams',
                'Real-time analytics and growth tracking',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-700 dark:text-zinc-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
