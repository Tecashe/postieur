export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Caelpost
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Premium social scheduling
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
