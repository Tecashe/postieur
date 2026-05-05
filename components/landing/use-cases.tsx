'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Users, Briefcase, Rocket, Store } from 'lucide-react'

const useCases = [
  {
    icon: Users,
    title: 'Content Creators',
    description: 'Solo creators and influencers managing multiple platforms at scale',
    benefits: ['Multi-platform posting', 'Audience analytics', 'Content calendar', 'Revenue insights'],
    gradient: 'from-emerald-50 dark:from-emerald-950 to-emerald-100 dark:to-emerald-900',
  },
  {
    icon: Briefcase,
    title: 'Marketing Teams',
    description: 'Agencies and in-house teams coordinating content across clients',
    benefits: ['Team collaboration', 'Approval workflows', 'Client management', 'Campaign tracking'],
    gradient: 'from-blue-50 dark:from-blue-950 to-blue-100 dark:to-blue-900',
  },
  {
    icon: Briefcase,
    title: 'Brands & Companies',
    description: 'Enterprise organizations managing brand presence across platforms',
    benefits: ['Brand consistency', 'Employee advocacy', 'Crisis management', 'Compliance tools'],
    gradient: 'from-purple-50 dark:from-purple-950 to-purple-100 dark:to-purple-900',
  },
  {
    icon: Store,
    title: 'E-commerce Businesses',
    description: 'Online retailers driving sales through social commerce',
    benefits: ['Product integration', 'Sales tracking', 'Inventory sync', 'Promotional tools'],
    gradient: 'from-orange-50 dark:from-orange-950 to-orange-100 dark:to-orange-900',
  },
]

export function UseCases() {
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
            Built for everyone
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Whether you're a solo creator or managing a global brand
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`p-8 h-full border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${useCase.gradient}`}>
                  <Icon className="w-10 h-10 text-zinc-900 dark:text-white mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                      Perfect for
                    </p>
                    <ul className="space-y-1">
                      {useCase.benefits.map((benefit) => (
                        <li key={benefit} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
