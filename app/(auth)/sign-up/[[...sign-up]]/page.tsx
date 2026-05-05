import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: 'oklch(0.55 0.12 55)',
          colorBackground: 'oklch(0.972 0.010 78)',
          colorText: 'oklch(0.18 0.025 48)',
          colorTextSecondary: 'oklch(0.45 0.025 48)',
          colorInputBackground: 'oklch(0.972 0.010 78)',
          colorInputText: 'oklch(0.18 0.025 48)',
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-cabinet)',
        },
        elements: {
          card: 'shadow-lg border border-border bg-card',
          headerTitle: 'font-display text-foreground',
          headerSubtitle: 'text-muted-foreground',
          formButtonPrimary:
            'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
          footerActionLink: 'text-primary hover:text-primary/80',
        },
      }}
    />
  )
}
