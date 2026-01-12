import Link from "next/link";
import { requireRole } from "@/lib/requireRole";

export default async function EvaluatorHome() {
  await requireRole(["EVALUATOR"]);

  return (
    <div className="card">
      <h1>Evaluator</h1>
      <p>Submit an evaluation.</p>
      <Link href="/evaluator/new">Start New Evaluation →</Link>
    </div>
  );
}
