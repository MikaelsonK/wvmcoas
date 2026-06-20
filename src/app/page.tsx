import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "ADMIN")     redirect("/admin");
    if (session.user.role === "EVALUATOR") redirect("/evaluator");
    redirect("/resident");
  }

  redirect("/login");
}
