'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '3 social accounts',
      '30 posts per month',
      'Basic analytics',
      'Community support',
      'Mobile app access',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For growing creators',
    features: [
      'Unlimited accounts',
      'Unlimited posts',
      'Advanced analytics',
      'AI-powered insights',
      'Content calendar',
      'Team collaboration',
      'Priority email support',
    ],
    cta: 'Start 14-Day Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For large teams',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Advanced security',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training',
    ],
    cta: 'Contact Sales',
    highlighted: false,
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

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light mb-4 text-zinc-900 dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Start free. Upgrade when you need to. Cancel anytime.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`relative p-8 rounded-lg border transition-all ${
                plan.highlighted
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 scale-105 md:scale-110'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                  Most popular
                </div>
              )}

              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                {plan.price !== null ? (
                  <div>
                    <span className="text-5xl font-light text-zinc-900 dark:text-white">${plan.price}</span>
                    <span className="text-zinc-600 dark:text-zinc-400 ml-2">/month</span>
                  </div>
                ) : (
                  <div className="text-5xl font-light text-zinc-900 dark:text-white">Custom</div>
                )}
              </div>

              <Button
                className={`w-full mb-6 h-10 ${
                  plan.highlighted
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
                    : ''
                }`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-sm text-zinc-600 dark:text-zinc-400"
        >
          All plans include 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
