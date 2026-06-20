"use client";

import React, { useState, useTransition } from "react";
import {
  Folder,
  FolderOpen,
  BookOpen,
  FileText,
  Trash2,
  Settings,
  ChevronRight,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Circle,
  Tag,
} from "lucide-react";
import { updateProcedureDomain, updateFormMappings, deleteDomain, deleteProcedure, deleteForm } from "./actions";
import { CreateDomainModalTrigger } from "@/components/CreateDomainForm";
import { CreateCategoryModalTrigger } from "@/components/CreateCategoryForm";
import { CreateProcedureModalTrigger } from "@/components/CreateProcedureForm";
import { CreateFormConfigModalTrigger } from "@/components/CreateFormConfigForm";
import { DialogModal } from "@/components/DialogModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainRow {
  id: string;
  name: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
}

interface ProcedureRow {
  id: string;
  name: string;
  procedureTypeId: string;
  domainId: string | null;
  type: { name: string };
  domain: { id: string; name: string } | null;
}

interface FormRow {
  id: string;
  title: string;
  domainId: string | null;
  procedureId: string | null;
  domain: { id: string; name: string } | null;
  procedure: { id: string; name: string } | null;
  questions: any[];
}

interface CurriculumHubClientProps {
  domains: DomainRow[];
  procedures: ProcedureRow[];
  forms: FormRow[];
  procedureTypes: { id: string; name: string }[];
}

type NavSection = "domains" | "procedures" | "forms";

// ─── Two-step Delete Button ────────────────────────────────────────────────────

function DeleteButton({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-150">
        <button
          onClick={() => { onConfirm(); setArmed(false); }}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
        >
          <AlertTriangle size={10} /> Confirm
        </button>
        <button
          onClick={() => setArmed(false)}
          className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setArmed(true)}
      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
      title={`Delete ${label}`}
    >
      <Trash2 size={13} />
    </button>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color} bg-white`}>
      <span className="opacity-70">{icon}</span>
      <div>
        <p className="text-[18px] font-extrabold leading-none">{value}</p>
        <p className="text-[10px] font-medium opacity-60 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ count, color = "gray" }: { count: number; color?: "red" | "gold" | "blue" | "gray" }) {
  const colors = {
    red: "bg-red-100 text-red-700 border-red-200",
    gold: "bg-amber-100 text-amber-700 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full border ${colors[color]}`}>
      {count}
    </span>
  );
}

// ─── Mapping Chip ──────────────────────────────────────────────────────────────

function MappingChip({ icon, label, variant }: { icon: React.ReactNode; label: string; variant: "domain" | "procedure" | "unmapped" }) {
  if (variant === "unmapped") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-medium rounded-full bg-gray-100 text-gray-400 border border-gray-200">
        <Circle size={8} /> Unmapped
      </span>
    );
  }
  if (variant === "domain") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
        <Folder size={9} /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <BookOpen size={9} /> {label}
    </span>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CurriculumHubClient({
  domains,
  procedures,
  forms,
  procedureTypes,
}: CurriculumHubClientProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("domains");
  const [isPending, startTransition] = useTransition();
  const [editingProcedure, setEditingProcedure] = useState<ProcedureRow | null>(null);
  const [editingForm, setEditingForm] = useState<FormRow | null>(null);

  // Stats
  const rootDomains = domains.filter((d) => !d.parentId);
  const unmappedProcedures = procedures.filter((p) => !p.domainId);
  const unmappedForms = forms.filter((f) => !f.domainId && !f.procedureId);
  const totalUnmapped = unmappedProcedures.length + unmappedForms.length;

  // Handlers
  const handleProcedureDomainChange = (procId: string, domainId: string) => {
    startTransition(async () => {
      await updateProcedureDomain(procId, domainId === "unmapped" ? null : domainId);
    });
  };

  const handleFormMappingsChange = (formId: string, domainId: string, procId: string) => {
    startTransition(async () => {
      await updateFormMappings(
        formId,
        domainId === "unmapped" ? null : domainId,
        procId === "unmapped" ? null : procId
      );
    });
  };

  const handleDeleteDomain = (id: string) => {
    startTransition(async () => {
      await deleteDomain(id);
    });
  };

  const handleDeleteProcedure = (id: string) => {
    startTransition(async () => {
      await deleteProcedure(id);
    });
  };

  const handleDeleteForm = (id: string) => {
    startTransition(async () => {
      await deleteForm(id);
    });
  };

  // Group procedures by category
  const proceduresByCategory: Record<string, ProcedureRow[]> = {};
  for (const proc of procedures) {
    const cat = proc.type.name;
    if (!proceduresByCategory[cat]) proceduresByCategory[cat] = [];
    proceduresByCategory[cat].push(proc);
  }

  // Navigation items
  const navItems: { id: NavSection; label: string; icon: React.ReactNode; count: number; color: "red" | "gold" | "blue" | "gray" }[] = [
    { id: "domains", label: "Clinical Domains", icon: <Folder size={16} />, count: domains.length, color: "red" },
    { id: "procedures", label: "Procedures", icon: <BookOpen size={16} />, count: procedures.length, color: "gold" },
    { id: "forms", label: "Evaluation Forms", icon: <FileText size={16} />, count: forms.length, color: "blue" },
  ];

  return (
    <div className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatPill icon={<Folder size={16} className="text-red-600" />} label="Domains" value={domains.length} color="border-red-200 text-red-800" />
        <StatPill icon={<BookOpen size={16} className="text-amber-600" />} label="Procedures" value={procedures.length} color="border-amber-200 text-amber-800" />
        <StatPill icon={<FileText size={16} className="text-blue-600" />} label="Eval Forms" value={forms.length} color="border-blue-200 text-blue-800" />
        <StatPill icon={<AlertTriangle size={16} className="text-orange-500" />} label="Unmapped" value={totalUnmapped} color={totalUnmapped > 0 ? "border-orange-200 text-orange-700" : "border-gray-200 text-gray-500"} />
      </div>

      {/* Main Layout */}
      <div className="flex gap-5 items-start">

        {/* Left Navigation Panel */}
        <div className="w-[220px] shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs sticky top-4">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Curriculum</p>
          </div>
          <nav className="p-2 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-brand-red text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-semibold">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="p-2 pt-0">
            <div className="border-t border-gray-100 mt-1 pt-2 px-2">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Select a section to manage domains, procedures, and evaluation forms.
              </p>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 min-w-0">

          {/* ── DOMAINS SECTION ─────────────────────────── */}
          {activeSection === "domains" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Folder size={16} className="text-brand-red" />
                    Clinical Domains
                  </h2>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    Organize your curriculum into root domains and sub-domains.
                  </p>
                </div>
                <CreateDomainModalTrigger domains={domains} />
              </div>

              <div className="p-4">
                {rootDomains.length === 0 ? (
                  <EmptyState
                    icon={<Folder size={28} />}
                    title="No domains yet"
                    description="Create your first clinical domain to start organizing your curriculum."
                    action={<CreateDomainModalTrigger domains={domains} />}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {rootDomains.map((root) => {
                      const rootChildren = domains.filter((d) => d.parentId === root.id);
                      const linkedProcedures = procedures.filter((p) => p.domainId === root.id);
                      const linkedForms = forms.filter((f) => f.domainId === root.id);

                      return (
                        <div
                          key={root.id}
                          className="rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                        >
                          {/* Root Domain Row */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/60">
                            <FolderOpen size={16} className="text-brand-red shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13.5px] font-bold text-gray-900 truncate">{root.name}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {linkedProcedures.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <BookOpen size={8} /> {linkedProcedures.length} proc.
                                </span>
                              )}
                              {linkedForms.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                  <FileText size={8} /> {linkedForms.length} forms
                                </span>
                              )}
                              {rootChildren.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                  <Folder size={8} /> {rootChildren.length} sub
                                </span>
                              )}
                              <DeleteButton onConfirm={() => handleDeleteDomain(root.id)} label="domain" />
                            </div>
                          </div>

                          {/* Sub-domains */}
                          {rootChildren.length > 0 && (
                            <div className="divide-y divide-gray-100">
                              {rootChildren.map((child) => {
                                const childProcs = procedures.filter((p) => p.domainId === child.id);
                                const childForms = forms.filter((f) => f.domainId === child.id);
                                return (
                                  <div key={child.id} className="flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                                    <ChevronRight size={11} className="text-gray-300 shrink-0" />
                                    <Folder size={13} className="text-gray-400 shrink-0" />
                                    <span className="flex-1 text-[12.5px] font-medium text-gray-700 truncate">{child.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {childProcs.length > 0 && (
                                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                          {childProcs.length} proc.
                                        </span>
                                      )}
                                      {childForms.length > 0 && (
                                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                                          {childForms.length} forms
                                        </span>
                                      )}
                                      <DeleteButton onConfirm={() => handleDeleteDomain(child.id)} label="sub-domain" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PROCEDURES SECTION ──────────────────────── */}
          {activeSection === "procedures" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500" />
                    Procedures
                  </h2>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    Manage procedures and link them to their clinical domains.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CreateCategoryModalTrigger />
                  <CreateProcedureModalTrigger categories={procedureTypes} />
                </div>
              </div>

              <div className="p-4">
                {procedures.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={28} />}
                    title="No procedures yet"
                    description="Add procedures and map them to clinical domains to build your curriculum."
                    action={<CreateProcedureModalTrigger categories={procedureTypes} />}
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Unmapped section first if any */}
                    {unmappedProcedures.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <AlertTriangle size={12} className="text-orange-400" />
                          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                            Unmapped ({unmappedProcedures.length})
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {unmappedProcedures.map((proc) => (
                            <ProcedureCard
                              key={proc.id}
                              proc={proc}
                              domains={domains}
                              onEdit={() => setEditingProcedure(proc)}
                              onDelete={() => handleDeleteProcedure(proc.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grouped by category */}
                    {Object.entries(proceduresByCategory)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([category, procs]) => {
                        const mappedProcs = procs.filter((p) => p.domainId);
                        if (mappedProcs.length === 0) return null;
                        return (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <Tag size={11} className="text-gray-400" />
                              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                {category}
                              </p>
                              <Badge count={mappedProcs.length} color="gray" />
                            </div>
                            <div className="flex flex-col gap-2">
                              {mappedProcs.map((proc) => (
                                <ProcedureCard
                                  key={proc.id}
                                  proc={proc}
                                  domains={domains}
                                  onEdit={() => setEditingProcedure(proc)}
                                  onDelete={() => handleDeleteProcedure(proc.id)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FORMS SECTION ───────────────────────────── */}
          {activeSection === "forms" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    Evaluation Forms
                  </h2>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    Create evaluation sheets and link them to domains or procedures.
                  </p>
                </div>
                <CreateFormConfigModalTrigger domains={domains} />
              </div>

              <div className="p-4">
                {forms.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={28} />}
                    title="No evaluation forms yet"
                    description="Create your first evaluation form and map it to a clinical domain or procedure."
                    action={<CreateFormConfigModalTrigger domains={domains} />}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Unmapped forms */}
                    {unmappedForms.length > 0 && (
                      <div className="mb-1">
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <AlertTriangle size={12} className="text-orange-400" />
                          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                            Unmapped ({unmappedForms.length})
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {unmappedForms.map((form) => (
                            <FormCard
                              key={form.id}
                              form={form}
                              onEdit={() => setEditingForm(form)}
                              onDelete={() => handleDeleteForm(form.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mapped forms */}
                    {forms.filter((f) => f.domainId || f.procedureId).length > 0 && (
                      <div>
                        {unmappedForms.length > 0 && (
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">
                              Mapped ({forms.filter((f) => f.domainId || f.procedureId).length})
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          {forms
                            .filter((f) => f.domainId || f.procedureId)
                            .map((form) => (
                              <FormCard
                                key={form.id}
                                form={form}
                                onEdit={() => setEditingForm(form)}
                                onDelete={() => handleDeleteForm(form.id)}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Procedure Mapping Modal ─── */}
      {editingProcedure && (
        <DialogModal
          isOpen={!!editingProcedure}
          onOpenChange={(open) => !open && setEditingProcedure(null)}
          title={`Map Procedure: ${editingProcedure.name}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Select the Clinical Competency Domain that this procedure belongs to.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-gray-600">Clinical Domain</label>
              <select
                value={editingProcedure.domainId || "unmapped"}
                onChange={(e) => {
                  handleProcedureDomainChange(editingProcedure.id, e.target.value);
                  setEditingProcedure(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer"
              >
                <option value="unmapped">— Unmapped —</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.parentId ? "↳ " : ""}{d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DialogModal>
      )}

      {/* ── Edit Form Mapping Modal ─── */}
      {editingForm && (
        <DialogModal
          isOpen={!!editingForm}
          onOpenChange={(open) => !open && setEditingForm(null)}
          title={`Map Form: ${editingForm.title}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Link this evaluation sheet to a Clinical Domain or a specific Procedure.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-gray-600">Clinical Domain</label>
                <select
                  value={editingForm.domainId || "unmapped"}
                  onChange={(e) => {
                    handleFormMappingsChange(
                      editingForm.id,
                      e.target.value,
                      editingForm.procedureId || "unmapped"
                    );
                    setEditingForm((prev) => prev ? { ...prev, domainId: e.target.value === "unmapped" ? null : e.target.value } : null);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer"
                >
                  <option value="unmapped">— Unmapped —</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.parentId ? "↳ " : ""}{d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-gray-600">Procedure</label>
                <select
                  value={editingForm.procedureId || "unmapped"}
                  onChange={(e) => {
                    handleFormMappingsChange(
                      editingForm.id,
                      editingForm.domainId || "unmapped",
                      e.target.value
                    );
                    setEditingForm((prev) => prev ? { ...prev, procedureId: e.target.value === "unmapped" ? null : e.target.value } : null);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer"
                >
                  <option value="unmapped">— Unmapped —</option>
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setEditingForm(null)}
              className="mt-1 px-4 py-2 text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] rounded-lg transition-colors cursor-pointer self-start"
            >
              Done
            </button>
          </div>
        </DialogModal>
      )}
    </div>
  );
}

// ─── Procedure Card ────────────────────────────────────────────────────────────

function ProcedureCard({
  proc,
  domains,
  onEdit,
  onDelete,
}: {
  proc: ProcedureRow;
  domains: DomainRow[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs transition-all group">
      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
        <Activity size={14} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{proc.name}</p>
        <div className="flex items-center flex-wrap gap-1.5 mt-1">
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {proc.type.name}
          </span>
          {proc.domain ? (
            <MappingChip icon={null} label={proc.domain.name} variant="domain" />
          ) : (
            <MappingChip icon={null} label="" variant="unmapped" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
          title="Edit Mapping"
        >
          <Settings size={13} />
        </button>
        <DeleteButton onConfirm={onDelete} label="procedure" />
      </div>
    </div>
  );
}

// ─── Form Card ─────────────────────────────────────────────────────────────────

function FormCard({
  form,
  onEdit,
  onDelete,
}: {
  form: FormRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs transition-all group">
      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <FileText size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{form.title}</p>
        <div className="flex items-center flex-wrap gap-1.5 mt-1">
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {form.questions.length} criteria
          </span>
          {form.domain && <MappingChip icon={null} label={form.domain.name} variant="domain" />}
          {form.procedure && <MappingChip icon={null} label={form.procedure.name} variant="procedure" />}
          {!form.domain && !form.procedure && <MappingChip icon={null} label="" variant="unmapped" />}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
          title="Edit Mapping"
        >
          <Settings size={13} />
        </button>
        <DeleteButton onConfirm={onDelete} label="form" />
      </div>
    </div>
  );
}
