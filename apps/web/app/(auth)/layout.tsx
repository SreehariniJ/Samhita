export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-y-auto bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))]">
      <div className="flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </main>
  );
}
