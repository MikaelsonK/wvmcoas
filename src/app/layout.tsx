import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          {session ? (
            <DashboardLayout user={session.user}>
              {children}
            </DashboardLayout>
          ) : (
          <>{children}</>
          )}
        </Providers>
      </body>
    </html>
  );
}
