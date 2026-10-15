"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { PatrimonioProvider } from "@/features/patrimonio/store";
import { AppShell } from "@/features/patrimonio/shell";

function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return children;
  return <AppShell>{children}</AppShell>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PatrimonioProvider>
      <Suspense fallback={null}>
        <AppFrame>{children}</AppFrame>
      </Suspense>
      <Toaster richColors position="top-right" />
    </PatrimonioProvider>
  );
}
