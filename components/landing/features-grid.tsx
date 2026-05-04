'use client'

import { motion } from 'framer-motion'
import { Calendar, BarChart3, Users, Zap, Shield, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Schedule posts weeks in advance across all your platforms. AI suggests optimal posting times based on your audience.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Understand what resonates with your audience. Track every metric that matters in real-time.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Build with your team. Assign roles, approve content, and track progress together.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Get actionable recommendations on captions, hashtags, and posting strategies.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: '256-bit encryption, SSO, and compliance with GDPR, SOC2, and HIPAA.',
  },
  {
    icon: Sparkles,
    title: 'Content Library',
    description: 'Organize and reuse your best templates. Built-in design tools for quick edits.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light mb-4 text-zinc-900 dark:text-white">
            Everything you need
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Built for modern creators and marketing teams who want to grow smarter, not harder.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
              >
                <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
