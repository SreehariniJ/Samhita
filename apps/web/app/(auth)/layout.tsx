export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-y-auto bg-background">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))]" />
        {children}
      </div>
    </main>
  );
}
