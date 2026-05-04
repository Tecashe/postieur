'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient background (subtle) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 dark:bg-emerald-950 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-zinc-200 dark:bg-zinc-800 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">Trusted by 10K+ creators</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light leading-tight mb-6 text-zinc-900 dark:text-white">
          Schedule smarter.{' '}
          <span className="text-emerald-600 dark:text-emerald-400">Grow faster.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p variants={item} className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Post across Instagram, TikTok, LinkedIn, X and more from one beautiful platform. Analyze what works. Grow with data.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-base h-12 px-8">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="border-zinc-300 dark:border-zinc-700 text-base h-12 px-8">
            View Demo
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div variants={item} className="mt-12 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="mb-4">No credit card required. Start scheduling in minutes.</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Powerful analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Team collaboration</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Animated scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-zinc-300 dark:border-zinc-700 rounded-full flex items-start justify-center pt-2">
          <motion.div className="w-1 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
