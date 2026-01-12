import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="card">
        <h1>OAS MVP</h1>
        <p>Please login.</p>
      </div>
    );
  }

  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "EVALUATOR") redirect("/evaluator");
  redirect("/resident");
}
