'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light leading-tight">
            Ready to grow smarter?
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto">
            Join thousands of creators already scheduling smarter with Schedulify. Start free today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 text-base h-12 px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800 text-base h-12 px-8"
            >
              View Demo
            </Button>
          </div>

          <p className="text-sm text-zinc-400 pt-4">
            14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
