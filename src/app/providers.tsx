"use client";

import { SessionProvider } from "next-auth/react";
import { RouterProvider } from "react-aria-components";
import { useRouter } from "next/navigation";

function ReactAriaRouterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <RouterProvider navigate={router.push}>
      {children}
    </RouterProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReactAriaRouterProvider>
        {children}
      </ReactAriaRouterProvider>
    </SessionProvider>
  );
}
