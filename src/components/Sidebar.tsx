"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Users,
  UserCheck,
  Activity,
  Award,
  FileText,
  FileSpreadsheet,
  Network,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  role: string;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function NavLink({ href, label, icon, onClick }: NavItem & { onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
        active
          ? "bg-brand-red/8 text-brand-red font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className={active ? "text-brand-red" : "text-gray-400"}>{icon}</span>
      {label}
    </Link>
  );
}

function Section({ label, items, onItemClick }: { label: string; items: NavItem[]; onItemClick?: () => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10.5px] text-gray-400 uppercase tracking-widest font-semibold px-3 mb-1">{label}</p>
      {items.map(item => <NavLink key={item.href} {...item} onClick={onItemClick} />)}
    </div>
  );
}

export function Sidebar({ role, onClose }: SidebarProps) {
  const adminFeatures: NavItem[] = [
    { href: "/admin",                    label: "Dashboard",          icon: <LayoutDashboard size={15} /> },
    { href: "/admin/periods",            label: "Grading Sheet",      icon: <ClipboardList size={15} /> },
    { href: "/admin/procedure-summary",  label: "Procedure Summary",  icon: <TrendingUp size={15} /> },
    { href: "/admin/residents",          label: "Residents",          icon: <Users size={15} /> },
    { href: "/admin/evaluators",         label: "Evaluators",         icon: <UserCheck size={15} /> },
    { href: "/admin/patients",           label: "Patients",           icon: <Activity size={15} /> },
  ];

  const adminSystem: NavItem[] = [
    { href: "/admin/forms",       label: "Forms config",       icon: <FileSpreadsheet size={15} /> },
    { href: "/admin/domains",     label: "Domains config",     icon: <Network size={15} /> },
    { href: "/admin/procedures",  label: "Procedures config",  icon: <Settings size={15} /> },
  ];

  const evaluatorLinks: NavItem[] = [
    { href: "/evaluator",      label: "Dashboard",         icon: <LayoutDashboard size={15} /> },
    { href: "/evaluator/new",  label: "Submit Evaluation", icon: <FileText size={15} /> },
  ];

  const residentLinks: NavItem[] = [
    { href: "/resident",             label: "Dashboard",       icon: <LayoutDashboard size={15} /> },
    { href: "/resident/ratings",     label: "Ratings",         icon: <Award size={15} /> },
    { href: "/resident/procedures",  label: "Procedure Count", icon: <Activity size={15} /> },
  ];

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-gray-200 flex flex-col gap-5 px-3 py-5 overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center justify-between px-3 mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
            <Image src="/oas_logo.png" alt="OAS Portal" width={28} height={28} className="object-cover" />
          </div>
          <span className="text-[13.5px] font-bold text-gray-900 tracking-tight">OAS Portal</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden outline-none cursor-pointer flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {role === "ADMIN" && (
        <>
          <Section label="Features" items={adminFeatures} onItemClick={onClose} />
          <Section label="System" items={adminSystem} onItemClick={onClose} />
        </>
      )}

      {role === "EVALUATOR" && (
        <Section label="Features" items={evaluatorLinks} onItemClick={onClose} />
      )}

      {role === "RESIDENT" && (
        <Section label="Features" items={residentLinks} onItemClick={onClose} />
      )}
    </aside>
  );
}
