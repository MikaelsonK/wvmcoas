import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { TopHeader } from "@/components/TopHeader";
import { Sidebar } from "@/components/Sidebar";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          {session ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
              <TopHeader user={session.user} />
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <Sidebar role={session.user.role} />
                <main style={{ flex: 1, overflowY: "auto", padding: 24, backgroundColor: "var(--bg-secondary)" }}>
                  {children}
                </main>
              </div>
            </div>
          ) : (
          <>{children}</>
          )}
        </Providers>
      </body>
    </html>
  );
}
