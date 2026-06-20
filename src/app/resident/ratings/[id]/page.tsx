import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ResidentRatingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["RESIDENT", "EVALUATOR", "ADMIN"]);
  const { id } = await params;

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      evaluator: { select: { name: true, email: true } },
      form: {
        include: {
          questions: true,
        },
      },
      scores: {
        include: {
          question: true,
        },
      },
      period: { select: { name: true } },
    },
  });

  if (!evaluation) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center max-w-md mx-auto shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Evaluation Not Found</h1>
          <p className="text-sm text-gray-400 mb-4">The evaluation you requested could not be found or has been deleted.</p>
          <Link
            href="/resident/ratings"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors inline-block"
          >
            ← Back to Ratings
          </Link>
        </div>
      </div>
    );
  }

  const scoreMap = new Map<string, number>();
  for (const s of evaluation.scores) {
    scoreMap.set(s.questionId, s.points);
  }

  const questionRows = evaluation.form.questions.map((q) => {
    const scoredPoints = scoreMap.get(q.id) ?? 0;
    const percentage = q.maxPoints > 0 ? Math.round((scoredPoints / q.maxPoints) * 100) : 0;
    return {
      id: q.id,
      label: q.label,
      maxPoints: q.maxPoints,
      scoredPoints,
      percentage,
    };
  });

  const totalScored = questionRows.reduce((sum, r) => sum + r.scoredPoints, 0);
  const totalMax = questionRows.reduce((sum, r) => sum + r.maxPoints, 0);
  const totalPercentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Evaluation Performance Details</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Detailed breakdown of scores for evaluation form <span className="font-semibold text-gray-600">{evaluation.form.title}</span>
          </p>
        </div>
        <Link
          href="/resident/ratings"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          ← Back to Ratings
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Info Card */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-brand-red border-b border-gray-100 pb-3 mb-4">
            Metadata & Evaluator Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Evaluator Name</span>
              <strong className="text-sm font-semibold text-gray-900 mt-0.5 block">{evaluation.evaluator.name}</strong>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Evaluator Email</span>
              <strong className="text-sm font-semibold text-gray-900 mt-0.5 block">{evaluation.evaluator.email}</strong>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Evaluation Period</span>
              <strong className="text-sm font-semibold text-gray-900 mt-0.5 block">{evaluation.period.name}</strong>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Submission Date</span>
              <strong className="text-sm font-semibold text-gray-900 mt-0.5 block">
                {evaluation.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>
        </div>

        {/* Scoring Summary Card */}
        <div className="bg-white border border-brand-red/30 rounded-xl p-5 shadow-sm flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Score</h3>
          <div className="text-4xl font-extrabold text-brand-red my-4">
            {totalScored} <span className="text-xl font-normal text-gray-400">/ {totalMax}</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            totalPercentage >= 85
              ? "bg-green-50 text-green-700 border border-green-200"
              : totalPercentage >= 70
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {totalPercentage}% Average Rating
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[13.5px] font-bold text-gray-900">Question-by-Question Scores</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Evaluation Criteria / Question</th>
              <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Scored Points</th>
              <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Max Points</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {questionRows.map((q) => (
              <tr key={q.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">
                  {q.label}
                </td>
                <td className="px-4 py-3 text-[13.5px] font-bold text-brand-red text-center">
                  {q.scoredPoints}
                </td>
                <td className="px-4 py-3 text-[13px] text-gray-400 text-center">
                  {q.maxPoints}
                </td>
                <td className="px-4 py-3 text-[13px] text-gray-900 font-medium text-right">
                  {q.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
