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
            <div className="flex flex-col h-screen">
              <TopHeader user={session.user} />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar role={session.user.role} />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
