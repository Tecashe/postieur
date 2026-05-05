import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <Image src="/apple-touch-icon.png" alt="Caelpost Logo" width={32} height={32} className="object-cover" />
          </div>
          <span className="font-serif font-semibold text-zinc-900 dark:text-white hidden sm:inline">Caelpost</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            FAQ
          </a>
          <a href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Dashboard
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
            <a href="/dashboard">Sign In</a>
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm">
            Start Free
          </Button>
        </div>
      </div>
    </nav>
  )
}
