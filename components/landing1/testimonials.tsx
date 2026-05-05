'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: "Schedulify cut our content planning time in half. We went from managing 5 different apps to just one beautiful platform.",
    author: "Sarah Chen",
    title: "Content Director",
    company: "TechVentures",
    rating: 5,
  },
  {
    quote: "The analytics insights are incredible. We discovered that our audience engages 3x more with video content at 2pm. Game changer.",
    author: "Marcus Johnson",
    title: "Marketing Manager",
    company: "Creative Studios",
    rating: 5,
  },
  {
    quote: "Finally, a tool that teams can actually collaborate on. No more miscommunication about what's scheduled or approved.",
    author: "Emily Rodriguez",
    title: "Social Media Lead",
    company: "Digital Agency Pro",
    rating: 5,
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

export function Testimonials() {
  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-light mb-4 text-zinc-900 dark:text-white">
            Loved by creators
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            See what real users are saying about Schedulify
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{testimonial.title} at {testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
