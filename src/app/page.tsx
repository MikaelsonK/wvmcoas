import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect straight to their role dashboard
  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "EVALUATOR") redirect("/evaluator");
    redirect("/resident");
  }

  return <LandingPageClient />;
}
