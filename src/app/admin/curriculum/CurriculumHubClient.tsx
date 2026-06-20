"use client";

import React, { useState, useTransition } from "react";
import { Network, Folder, BookOpen, Layers, Trash2, ArrowRight } from "lucide-react";
import { updateProcedureDomain, updateFormMappings, deleteDomain, deleteProcedure, deleteForm } from "./actions";
import { CreateDomainModalTrigger } from "@/components/CreateDomainForm";
import { CreateCategoryModalTrigger } from "@/components/CreateCategoryForm";
import { CreateProcedureModalTrigger } from "@/components/CreateProcedureForm";
import { CreateFormConfigModalTrigger } from "@/components/CreateFormConfigForm";

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

export function CurriculumHubClient({
  domains,
  procedures,
  forms,
  procedureTypes,
}: CurriculumHubClientProps) {
  const [activeTab, setActiveTab] = useState<"columns" | "graph">("columns");
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ type: "domain" | "procedure" | "form"; id: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Helper: Find all descendant domain IDs
  const getDescendantIds = (domainId: string): string[] => {
    const list: string[] = [domainId];
    const queue = [domainId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = domains.filter((d) => d.parentId === current);
      for (const child of children) {
        if (!list.includes(child.id)) {
          list.push(child.id);
          queue.push(child.id);
        }
      }
    }
    return list;
  };

  const activeDomainIds = selectedDomainId ? getDescendantIds(selectedDomainId) : [];

  // Filtered lists based on sidebar selection
  const filteredProcedures = selectedDomainId
    ? procedures.filter((p) => p.domainId && activeDomainIds.includes(p.domainId))
    : procedures;

  const filteredForms = selectedDomainId
    ? forms.filter(
        (f) =>
          (f.domainId && activeDomainIds.includes(f.domainId)) ||
          (f.procedureId &&
            procedures.some(
              (p) => p.id === f.procedureId && p.domainId && activeDomainIds.includes(p.domainId)
            ))
      )
    : forms;

  // Connection Helpers (for highlights)
  const isConnected = (type: "domain" | "procedure" | "form", id: string): boolean => {
    if (!hoveredNode) return true; // Default: no highlight filter, fully colored

    const { type: ht, id: hid } = hoveredNode;

    if (ht === "domain") {
      const descIds = getDescendantIds(hid);
      if (type === "domain") return descIds.includes(id) || id === hid;
      if (type === "procedure") return !!(procedures.find((p) => p.id === id)?.domainId && descIds.includes(procedures.find((p) => p.id === id)!.domainId!));
      if (type === "form") {
        const formObj = forms.find((f) => f.id === id);
        if (!formObj) return false;
        const directlyMapped = formObj.domainId && descIds.includes(formObj.domainId);
        const procedureMapped =
          formObj.procedureId &&
          procedures.some(
            (p) => p.id === formObj.procedureId && p.domainId && descIds.includes(p.domainId)
          );
        return !!(directlyMapped || procedureMapped);
      }
    }

    if (ht === "procedure") {
      const proc = procedures.find((p) => p.id === hid);
      if (!proc) return false;
      if (type === "domain") return id === proc.domainId;
      if (type === "procedure") return id === hid;
      if (type === "form") return forms.find((f) => f.id === id)?.procedureId === hid;
    }

    if (ht === "form") {
      const form = forms.find((f) => f.id === hid);
      if (!form) return false;
      if (type === "domain") return id === form.domainId;
      if (type === "procedure") return id === form.procedureId;
      if (type === "form") return id === hid;
    }

    return false;
  };

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
    if (confirm("Are you sure you want to delete this domain? This will not delete sub-domains or forms, but will remove their association.")) {
      startTransition(async () => {
        await deleteDomain(id);
        if (selectedDomainId === id) setSelectedDomainId(null);
      });
    }
  };

  const handleDeleteProcedure = (id: string) => {
    if (confirm("Are you sure you want to delete this procedure?")) {
      startTransition(async () => {
        await deleteProcedure(id);
      });
    }
  };

  const handleDeleteForm = (id: string) => {
    if (confirm("Are you sure you want to delete this form? All questions and associated evaluations will be lost!")) {
      startTransition(async () => {
        await deleteForm(id);
      });
    }
  };

  // Node placements for visual graph
  const graphDomains = domains.filter((d) => !d.parentId); // Only root domains for simple graph readability
  const graphProcedures = procedures.filter((p) => p.domainId);
  const graphForms = forms.filter((f) => f.domainId || f.procedureId);

  return (
    <div className={`transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          onClick={() => setActiveTab("columns")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "columns"
              ? "border-brand-red text-brand-red"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers size={15} /> Column Map
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "graph"
              ? "border-brand-red text-brand-red"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Network size={15} /> Visual Schema Graph
        </button>
      </div>

      {activeTab === "columns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* COLUMN 1: DOMAINS */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[600px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Folder className="text-brand-red" size={16} /> Clinical Domains
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Select a domain to filter mappings.</p>
              </div>
              <CreateDomainModalTrigger domains={domains} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <button
                onClick={() => setSelectedDomainId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  !selectedDomainId
                    ? "bg-brand-red/10 text-brand-red border border-brand-red/20 shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                📁 Show All Domains
              </button>

              <div className="space-y-1 mt-2">
                {domains
                  .filter((d) => !d.parentId)
                  .map((root) => {
                    const rootChildren = domains.filter((d) => d.parentId === root.id);
                    const isSelected = selectedDomainId === root.id;
                    const isAnyChildSelected = selectedDomainId && getDescendantIds(root.id).includes(selectedDomainId);

                    return (
                      <div
                        key={root.id}
                        onMouseEnter={() => setHoveredNode({ type: "domain", id: root.id })}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`rounded-lg border transition-all p-2.5 ${
                          isSelected
                            ? "bg-brand-red/5 border-brand-red/35"
                            : isConnected("domain", root.id)
                            ? "border-gray-100 hover:border-gray-200"
                            : "opacity-40 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedDomainId(root.id)}
                            className="flex-1 text-left font-bold text-[12.5px] text-gray-900 truncate hover:text-brand-red transition-colors"
                          >
                            🔴 {root.name}
                          </button>
                          <button
                            onClick={() => handleDeleteDomain(root.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Domain"
                          >
                            <Trash2 size={12.5} />
                          </button>
                        </div>

                        {/* Children */}
                        {rootChildren.length > 0 && (
                          <div className="pl-4 mt-2 border-l border-gray-100 space-y-1.5">
                            {rootChildren.map((child) => {
                              const isChildSelected = selectedDomainId === child.id;
                              return (
                                <div
                                  key={child.id}
                                  onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    setHoveredNode({ type: "domain", id: child.id });
                                  }}
                                  onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    setHoveredNode(null);
                                  }}
                                  className={`flex items-center justify-between gap-2 p-1.5 rounded-md transition-all ${
                                    isChildSelected
                                      ? "bg-brand-red/10 text-brand-red font-semibold"
                                      : isConnected("domain", child.id)
                                      ? "text-gray-600 hover:bg-gray-50"
                                      : "opacity-40"
                                  }`}
                                >
                                  <button
                                    onClick={() => setSelectedDomainId(child.id)}
                                    className="flex-1 text-left text-[12px] truncate"
                                  >
                                    🔸 {child.name}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDomain(child.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: PROCEDURES */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[600px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="text-brand-gold" size={16} /> Mapped Procedures
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Define procedures and link them to domains.</p>
              </div>
              <div className="flex gap-1.5">
                <CreateCategoryModalTrigger />
                <CreateProcedureModalTrigger categories={procedureTypes} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredProcedures.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No procedures found in the active scope.</p>
              ) : (
                filteredProcedures.map((proc) => {
                  const active = isConnected("procedure", proc.id);
                  return (
                    <div
                      key={proc.id}
                      onMouseEnter={() => setHoveredNode({ type: "procedure", id: proc.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-3 rounded-lg border border-gray-150 transition-all ${
                        active ? "bg-white hover:shadow-xs" : "opacity-30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-[12.5px] font-semibold text-gray-900 block leading-tight">
                            {proc.name}
                          </strong>
                          <span className="text-[10.5px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                            📂 {proc.type.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteProcedure(proc.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={12.5} />
                        </button>
                      </div>

                      {/* Domain Mapping Dropdown */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Domain</span>
                        <select
                          value={proc.domainId || "unmapped"}
                          onChange={(e) => handleProcedureDomainChange(proc.id, e.target.value)}
                          className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-brand-red focus:bg-white transition-colors max-w-[160px]"
                        >
                          <option value="unmapped">Unmapped</option>
                          {domains.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.parentId ? "🔸" : "🔴"} {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 3: FORMS */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[600px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Network className="text-brand-red" size={16} /> Evaluation Forms
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Map forms to domains or procedures.</p>
              </div>
              <CreateFormConfigModalTrigger domains={domains} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredForms.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No evaluation forms found.</p>
              ) : (
                filteredForms.map((form) => {
                  const active = isConnected("form", form.id);
                  return (
                    <div
                      key={form.id}
                      onMouseEnter={() => setHoveredNode({ type: "form", id: form.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-3 rounded-lg border border-gray-150 transition-all ${
                        active ? "bg-white hover:shadow-xs" : "opacity-30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-[12.5px] font-semibold text-gray-900 block leading-tight">
                            {form.title}
                          </strong>
                          <span className="text-[10px] text-brand-red font-medium bg-brand-red/5 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                            📝 {form.questions.length} criteria
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={12.5} />
                        </button>
                      </div>

                      {/* Mapping Configs */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        {/* Domain Link */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Domain Map</span>
                          <select
                            value={form.domainId || "unmapped"}
                            onChange={(e) => handleFormMappingsChange(form.id, e.target.value, form.procedureId || "unmapped")}
                            className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-brand-red focus:bg-white transition-colors max-w-[160px]"
                          >
                            <option value="unmapped">Unmapped</option>
                            {domains.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.parentId ? "🔸" : "🔴"} {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Procedure Link */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Procedure Map</span>
                          <select
                            value={form.procedureId || "unmapped"}
                            onChange={(e) => handleFormMappingsChange(form.id, form.domainId || "unmapped", e.target.value)}
                            className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-brand-red focus:bg-white transition-colors max-w-[160px]"
                          >
                            <option value="unmapped">Unmapped</option>
                            {procedures.map((p) => (
                              <option key={p.id} value={p.id}>
                                🩺 {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "graph" && (
        <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-4 relative">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Visual Curriculum Map</h3>
          <p className="text-[11.5px] text-gray-400 mb-6">
            Hover over any circle node to highlight the competency relationships and evaluation loops.
          </p>

          <div className="overflow-x-auto">
            <svg
              className="mx-auto min-w-[700px] w-full h-[520px]"
              viewBox="0 0 800 520"
            >
              {/* DEFINITIONS FOR SVG GRADIENTS AND FILTERS */}
              <defs>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* CURVES / CONNECTIONS */}
              {graphProcedures.map((proc, pIdx) => {
                const domIdx = graphDomains.findIndex((d) => d.id === proc.domainId);
                if (domIdx === -1) return null;

                const startX = 150;
                const startY = 80 + domIdx * 110;
                const endX = 400;
                const endY = 50 + pIdx * 50;

                const isPathActive = !hoveredNode ||
                  (hoveredNode.type === "domain" && hoveredNode.id === proc.domainId) ||
                  (hoveredNode.type === "procedure" && hoveredNode.id === proc.id);

                return (
                  <g key={`path-p-${proc.id}`}>
                    <path
                      d={`M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke={isPathActive ? "#a00707" : "#e5e7eb"}
                      strokeWidth={isPathActive ? 2 : 1}
                      strokeOpacity={isPathActive ? 0.75 : 0.25}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {graphForms.map((form, fIdx) => {
                const formsY = 50 + fIdx * 65;

                // Connection 1: Form to mapped Domain
                let domPath = null;
                if (form.domainId) {
                  const domIdx = graphDomains.findIndex((d) => d.id === form.domainId);
                  if (domIdx !== -1) {
                    const startX = 150;
                    const startY = 80 + domIdx * 110;
                    const endX = 650;
                    const endY = formsY;

                    const isPathActive = !hoveredNode ||
                      (hoveredNode.type === "domain" && hoveredNode.id === form.domainId) ||
                      (hoveredNode.type === "form" && hoveredNode.id === form.id);

                    domPath = (
                      <path
                        d={`M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={isPathActive ? "#a00707" : "#e5e7eb"}
                        strokeWidth={isPathActive ? 1.5 : 0.75}
                        strokeDasharray="4,4"
                        strokeOpacity={isPathActive ? 0.6 : 0.15}
                        className="transition-all duration-300"
                      />
                    );
                  }
                }

                // Connection 2: Form to mapped Procedure
                let procPath = null;
                if (form.procedureId) {
                  const procIdx = graphProcedures.findIndex((p) => p.id === form.procedureId);
                  if (procIdx !== -1) {
                    const startX = 400;
                    const startY = 50 + procIdx * 50;
                    const endX = 650;
                    const endY = formsY;

                    const isPathActive = !hoveredNode ||
                      (hoveredNode.type === "procedure" && hoveredNode.id === form.procedureId) ||
                      (hoveredNode.type === "form" && hoveredNode.id === form.id);

                    procPath = (
                      <path
                        d={`M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={isPathActive ? "#cd9804" : "#e5e7eb"}
                        strokeWidth={isPathActive ? 2 : 1}
                        strokeOpacity={isPathActive ? 0.75 : 0.25}
                        className="transition-all duration-300"
                      />
                    );
                  }
                }

                return (
                  <g key={`paths-f-${form.id}`}>
                    {domPath}
                    {procPath}
                  </g>
                );
              })}

              {/* DOMAIN NODES (COLUMN 1) */}
              <g>
                <text x="150" y="25" textAnchor="middle" className="text-[11px] font-extrabold fill-gray-400 uppercase tracking-widest">
                  Clinical Domains
                </text>
                {graphDomains.map((dom, idx) => {
                  const active = isConnected("domain", dom.id);
                  const isHovered = hoveredNode?.type === "domain" && hoveredNode.id === dom.id;
                  const cy = 80 + idx * 110;

                  return (
                    <g
                      key={dom.id}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredNode({ type: "domain", id: dom.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        cx="150"
                        cy={cy}
                        r={isHovered ? "28" : "24"}
                        fill="#a00707"
                        fillOpacity={active ? 1 : 0.2}
                        stroke="#fff"
                        strokeWidth="3.5"
                        filter={isHovered ? "url(#glow-red)" : ""}
                        className="transition-all duration-300"
                      />
                      <text
                        x="150"
                        y={cy + 4}
                        textAnchor="middle"
                        fill="#fff"
                        className="text-[10px] font-extrabold select-none"
                      >
                        {dom.name.slice(0, 4).toUpperCase()}
                      </text>
                      <text
                        x="135"
                        y={cy + 40}
                        textAnchor="end"
                        fill={active ? "#111827" : "#9ca3af"}
                        className={`text-[11px] font-bold transition-colors select-none ${isHovered ? "fill-brand-red font-extrabold" : ""}`}
                      >
                        {dom.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* PROCEDURE NODES (COLUMN 2) */}
              <g>
                <text x="400" y="25" textAnchor="middle" className="text-[11px] font-extrabold fill-gray-400 uppercase tracking-widest">
                  Procedures
                </text>
                {graphProcedures.map((proc, idx) => {
                  const active = isConnected("procedure", proc.id);
                  const isHovered = hoveredNode?.type === "procedure" && hoveredNode.id === proc.id;
                  const cy = 50 + idx * 50;

                  return (
                    <g
                      key={proc.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode({ type: "procedure", id: proc.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        cx="400"
                        cy={cy}
                        r={isHovered ? "15" : "11"}
                        fill="#96bfa4"
                        fillOpacity={active ? 1 : 0.15}
                        stroke="#fff"
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />
                      <text
                        x="380"
                        y={cy + 4}
                        textAnchor="end"
                        fill={active ? "#374151" : "#9ca3af"}
                        className={`text-[10.5px] font-semibold transition-colors select-none ${isHovered ? "fill-green-800 font-extrabold" : ""}`}
                      >
                        {proc.name.length > 32 ? proc.name.slice(0, 32) + "…" : proc.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* FORM NODES (COLUMN 3) */}
              <g>
                <text x="650" y="25" textAnchor="middle" className="text-[11px] font-extrabold fill-gray-400 uppercase tracking-widest">
                  Forms
                </text>
                {graphForms.map((form, idx) => {
                  const active = isConnected("form", form.id);
                  const isHovered = hoveredNode?.type === "form" && hoveredNode.id === form.id;
                  const cy = 50 + idx * 65;

                  return (
                    <g
                      key={form.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode({ type: "form", id: form.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        cx="650"
                        cy={cy}
                        r={isHovered ? "16" : "12"}
                        fill="#cd9804"
                        fillOpacity={active ? 1 : 0.15}
                        stroke="#fff"
                        strokeWidth="2.5"
                        filter={isHovered ? "url(#glow-gold)" : ""}
                        className="transition-all duration-300"
                      />
                      <text
                        x="670"
                        y={cy + 4}
                        textAnchor="start"
                        fill={active ? "#111827" : "#9ca3af"}
                        className={`text-[10.5px] font-bold transition-colors select-none ${isHovered ? "fill-brand-gold font-extrabold" : ""}`}
                      >
                        {form.title.length > 25 ? form.title.slice(0, 25) + "…" : form.title}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
