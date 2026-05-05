export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'oklch(0.972 0.010 78)', colorScheme: 'light' }}>
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight" style={{ color: 'oklch(0.160 0.018 48)' }}>
            Caelpost
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'oklch(0.45 0.025 48)' }}>
            Premium social scheduling
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
