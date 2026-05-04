'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How many social accounts can I manage?',
    answer: 'On the Starter plan, you can connect up to 3 accounts. The Pro plan supports unlimited accounts across all platforms.',
  },
  {
    question: 'Can I schedule posts in advance?',
    answer: 'Yes! Schedule posts weeks or months in advance. Our AI will even suggest the best times to post based on your audience.',
  },
  {
    question: 'What platforms are supported?',
    answer: 'We support Instagram, TikTok, LinkedIn, X (Twitter), Facebook, YouTube, Pinterest, Bluesky, and more. New platforms added regularly.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use 256-bit encryption, SOC 2 compliance, and regular security audits. Enterprise plans include SSO and advanced security.',
  },
  {
    question: 'Can multiple team members collaborate?',
    answer: 'Yes! Pro and Enterprise plans include unlimited team members with customizable roles and permissions.',
  },
  {
    question: 'How detailed are the analytics?',
    answer: 'Very detailed. Track engagement, reach, demographics, hashtag performance, posting times, and more with our AI insights.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
      >
        <span className="font-medium text-zinc-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-200 dark:border-zinc-800"
          >
            <p className="px-6 py-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  return (
    <section id="faq" className="py-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light mb-4 text-zinc-900 dark:text-white">
            Frequently asked
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <FAQItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-sm text-zinc-600 dark:text-zinc-400"
        >
          Can't find what you're looking for?{' '}
          <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Contact our support team
          </a>
        </motion.p>
      </div>
    </section>
  )
}
