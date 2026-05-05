'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

const features = [
  'Multi-platform scheduling',
  'AI-powered optimization',
  'Team collaboration',
  'Advanced analytics',
  'Content calendar',
  'Performance reports',
  'API access',
  'Custom integrations',
  'Priority support',
  'White-label option',
]

const comparison = [
  {
    product: 'Schedulify',
    highlight: true,
    features: [true, true, true, true, true, true, true, true, true, true],
  },
  {
    product: 'Competitors',
    highlight: false,
    features: [true, false, false, true, true, false, false, false, false, false],
  },
]

export function ComparisonTable() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-zinc-900 dark:text-white mb-4">
            See the difference
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Everything you need, nothing you don't
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <div className="min-w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature list column */}
              <div className="space-y-0 md:col-span-1">
                <div className="h-16" /> {/* Spacer for header */}
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="h-12 flex items-center text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 px-4"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product columns */}
              {comparison.map((product, idx) => (
                <div key={product.product}>
                  <Card className={`p-6 border-zinc-200 dark:border-zinc-800 ${product.highlight ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-zinc-900'} h-16 flex items-center justify-center`}>
                    <h3 className={`text-lg font-semibold ${product.highlight ? 'text-emerald-900 dark:text-emerald-100' : 'text-zinc-900 dark:text-white'}`}>
                      {product.product}
                    </h3>
                  </Card>
                  <div className="space-y-3 mt-0">
                    {product.features.map((included, featureIdx) => (
                      <div
                        key={featureIdx}
                        className="h-12 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800"
                      >
                        {included ? (
                          <Check className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <X className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
