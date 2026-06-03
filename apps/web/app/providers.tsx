"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useMemo } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 20_000,
            retry: (failureCount, error) => {
              const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
              if ([401, 403, 404].includes(status)) {
                return false;
              }
              return failureCount < 2;
            }
          }
        }
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
