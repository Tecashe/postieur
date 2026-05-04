'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const metrics = [
  { value: 10, suffix: 'K+', label: 'Active Creators', delay: 0 },
  { value: 50, suffix: 'M+', label: 'Posts Scheduled', delay: 0.1 },
  { value: 98, suffix: '%', label: 'Uptime', delay: 0.2 },
  { value: 47, suffix: 'B+', label: 'Total Impressions', delay: 0.3 },
]

function CountUp({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = value / 50
      let current = 0
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(interval)
        } else {
          setCount(Math.floor(current))
        }
      }, 30)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <>
      {count}
      {suffix}
    </>
  )
}

export function MetricsSection() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: metric.delay }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-light font-serif text-zinc-900 dark:text-white mb-2">
                <CountUp value={metric.value} suffix={metric.suffix} delay={metric.delay} />
              </div>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
