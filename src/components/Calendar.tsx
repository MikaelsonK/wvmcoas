"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import { createCalendarEvent, FormState } from "@/app/resident/actions";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  color?: string;
  startTime?: string | null;
  endTime?: string | null;
  url?: string | null;
  location?: string | null;
  details?: string | null;
}

interface CalendarProps {
  events: CalendarEvent[];
}

export function Calendar({ events }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createCalendarEvent, {} as FormState);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setIsAddEventOpen(false);
        formRef.current?.reset();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state]);
  const [eventColors, setEventColors] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("oas_event_colors");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {};
  });

  const saveEventColor = (eventId: string, color: string) => {
    const updated = { ...eventColors, [eventId]: color };
    setEventColors(updated);
    localStorage.setItem("oas_event_colors", JSON.stringify(updated));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarCells: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  const totalCells = 42;
  const nextMonthFiller = totalCells - calendarCells.length;
  for (let i = 1; i <= nextMonthFiller; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (e) =>
        new Date(e.date).getDate() === date.getDate() &&
        new Date(e.date).getMonth() === date.getMonth() &&
        new Date(e.date).getFullYear() === date.getFullYear()
    );
  };

  const colors = [
    { label: "Red", value: "#a00707" },
    { label: "Gold", value: "#cd9804" },
    { label: "Green", value: "#2e7d32" },
    { label: "Crimson", value: "#c52744" },
    { label: "Peach", value: "#eab984" },
    { label: "Blue", value: "#1a73e8" },
  ];

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 16 }}>
      
      {/* Side Panel: Downloadable Blank Forms */}
      <div className="card" style={{ flex: 1, minWidth: 260, padding: 20, alignSelf: "flex-start", backgroundColor: "var(--bg-secondary)" }}>
        <h4 style={{ margin: "0 0 16px 0", color: "var(--brand-red)", borderBottom: "2px solid var(--brand-gold)", paddingBottom: 8 }}>
          📥 Downloadable Blank Forms
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { name: "Clinical Competence Evaluation", desc: "For rotations and bedside clinical tasks." },
            { name: "OSCE Grading Rubric", desc: "Objective Structured Clinical Examination sheet." },
            { name: "RISE Exam Evaluation Form", desc: "Resident In-Service Examination rubric." },
            { name: "Oral Case Presentation Rubric", desc: "Evaluator sheet for case reviews." }
          ].map((form, idx) => (
            <div key={idx} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, backgroundColor: "var(--bg-primary)", fontSize: 13 }}>
              <strong>{form.name}</strong>
              <p style={{ color: "var(--muted)", margin: "4px 0 8px 0", fontSize: 11 }}>{form.desc}</p>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading blank PDF template: ${form.name}`);
                }}
                className="link-primary" 
                style={{ fontSize: 12, fontWeight: "bold" }}
              >
                Download PDF Template ↓
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="card" style={{ flex: 3, minWidth: 600, padding: 20 }}>
        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 22, color: "var(--text)" }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="button-primary" onClick={() => setIsAddEventOpen(true)} style={{ padding: "8px 16px", marginRight: 16 }}>
              ➕ Add Calendar Event
            </button>
            <button className="button-secondary" onClick={handlePrevMonth} style={{ padding: "6px 12px" }}>
              ◀ Prev
            </button>
            <button className="button-secondary" onClick={handleNextMonth} style={{ padding: "6px 12px" }}>
              Next ▶
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", fontWeight: "bold", marginBottom: 8, fontSize: 13, color: "var(--muted)" }}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Days Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {calendarCells.map((cell, idx) => {
            const dateEvents = getEventsForDate(cell.date);
            return (
              <div
                key={idx}
                style={{
                  minHeight: 90,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 6,
                  backgroundColor: cell.isCurrentMonth ? "var(--bg-primary)" : "var(--bg-secondary)",
                  color: cell.isCurrentMonth ? "var(--text)" : "var(--muted)",
                  opacity: cell.isCurrentMonth ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>{cell.day}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {dateEvents.map((ev) => {
                    const evColor = ev.color || eventColors[ev.id] || "var(--brand-red)";
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        style={{
                          fontSize: 10,
                          backgroundColor: evColor,
                          color: "white",
                          padding: "3px 6px",
                          borderRadius: 4,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: "500",
                        }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 12,
              maxWidth: 480,
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "var(--brand-red)" }}>Add Calendar Event</h3>
            
            <form ref={formRef} action={formAction}>
              {state?.message && (
                <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  {state.message}
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="evt-title">Event Title</label>
                <input id="evt-title" name="title" className="input-field" placeholder="e.g. RISE Exam Session" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-date">Date</label>
                <input id="evt-date" name="date" type="date" className="input-field" required />
              </div>

              <div className="row" style={{ marginBottom: 0 }}>
                <div className="col form-group">
                  <label className="form-label" htmlFor="evt-start">Start Time</label>
                  <input id="evt-start" name="startTime" type="time" className="input-field" />
                </div>
                <div className="col form-group">
                  <label className="form-label" htmlFor="evt-end">End Time</label>
                  <input id="evt-end" name="endTime" type="time" className="input-field" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-url">URL Link (Optional)</label>
                <input id="evt-url" name="url" type="url" className="input-field" placeholder="e.g. https://zoom.us/j/..." />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-loc">Location</label>
                <input id="evt-loc" name="location" className="input-field" placeholder="e.g. Conference Room B" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-details">Details</label>
                <textarea id="evt-details" name="details" className="input-field" style={{ minHeight: 60 }} placeholder="e.g. Reviewing mock MCQ questions" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-color">Highlight Color</label>
                <select id="evt-color" name="color" className="input-field">
                  {colors.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                <button type="button" className="button-secondary" onClick={() => setIsAddEventOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button-primary" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 12,
              maxWidth: 480,
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "var(--brand-red)" }}>{selectedEvent.title}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              <div>📅 <strong>Date</strong>: {new Date(selectedEvent.date).toDateString()}</div>
              {selectedEvent.startTime && (
                <div>⏰ <strong>Time</strong>: {selectedEvent.startTime} {selectedEvent.endTime ? `→ ${selectedEvent.endTime}` : ""}</div>
              )}
              {selectedEvent.location && (
                <div>📍 <strong>Location</strong>: {selectedEvent.location}</div>
              )}
              {selectedEvent.url && (
                <div>🔗 <strong>Link</strong>: <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="link-primary">{selectedEvent.url}</a></div>
              )}
            </div>

            <div style={{ padding: 12, backgroundColor: "var(--bg-secondary)", borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
              {selectedEvent.description || selectedEvent.details || "No details provided."}
            </div>

            {/* Color Picker Section */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                Select Event Color highlight:
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => saveEventColor(selectedEvent.id, c.value)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: c.value,
                      border: (selectedEvent.color || eventColors[selectedEvent.id]) === c.value ? "3px solid #111" : "1px solid #ccc",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="button-primary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
