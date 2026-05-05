import { motion } from 'framer-motion'

export function LogoStrip() {
  const companies = [
    'Featured on ProductHunt',
    'Trusted by Creators',
    'Recommended by Agencies',
    'Used Globally',
    'Award Winning',
  ]

  return (
    <section className="py-12 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-8">
          Trusted by creators worldwide
        </p>
        
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {companies.map((company, idx) => (
            <div key={idx} className="text-sm text-zinc-500 dark:text-zinc-500 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
