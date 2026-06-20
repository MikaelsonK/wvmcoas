import { requireRole } from "@/lib/requireRole";
import Link from "next/link";
import {
  ClipboardList, TrendingUp, Users, UserCheck,
  Activity, FileSpreadsheet, Network, Settings,
} from "lucide-react";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);

  const features = [
    { href: "/admin/periods",           icon: ClipboardList,   label: "Grading Sheet",      desc: "Manage evaluation periods and grading sheets." },
    { href: "/admin/procedure-summary", icon: TrendingUp,      label: "Procedure Summary",  desc: "View procedure completion summary per resident." },
    { href: "/admin/residents",         icon: Users,           label: "Residents",          desc: "Register and manage resident doctors." },
    { href: "/admin/evaluators",        icon: UserCheck,       label: "Evaluators",         desc: "Register and manage evaluating physicians." },
    { href: "/admin/patients",          icon: Activity,        label: "Patients",           desc: "Manage hospital patient records." },
  ];

  const system = [
    { href: "/admin/curriculum",  icon: Network,         label: "Curriculum Hub",     desc: "Consolidated mapping of competency domains, procedures, and evaluation sheets." },
  ];

  function NavCard({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
    return (
      <Link
        href={href}
        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-red/30 hover:shadow-sm transition-all duration-150 group"
      >
        <div className="w-9 h-9 rounded-lg bg-brand-red/8 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/12 transition-colors">
          <Icon size={16} className="text-brand-red" />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-gray-900">{label}</p>
          <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{desc}</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-lg font-bold text-gray-900 mb-1">Admin Console</h1>
      <p className="text-sm text-gray-400 mb-6">Manage the OAS Portal system.</p>

      <section className="mb-6">
        <p className="text-[10.5px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(f => <NavCard key={f.href} {...f} />)}
        </div>
      </section>

      <section>
        <p className="text-[10.5px] text-gray-400 uppercase tracking-widest font-semibold mb-3">System Configuration</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {system.map(f => <NavCard key={f.href} {...f} />)}
        </div>
      </section>
    </div>
  );
}
