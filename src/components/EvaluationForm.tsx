"use client";

import React from "react";
import { Form, TextField, Label, Input, Button } from "react-aria-components";

interface Question {
  id: string;
  label: string;
  maxPoints: number;
}

interface EvaluationFormProps {
  residentId: string;
  periodId: string;
  formId: string;
  evaluationId?: string;
  questions: Question[];
  initialScores: Record<string, number>;
}

export function EvaluationForm({
  residentId,
  periodId,
  formId,
  evaluationId,
  questions,
  initialScores,
}: EvaluationFormProps) {
  return (
    <Form method="post" action="/api/admin/evaluations" className="card" style={{ padding: 20 }}>
      <input type="hidden" name="residentId" value={residentId} />
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="formId" value={formId} />
      {evaluationId && <input type="hidden" name="evaluationId" value={evaluationId} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q) => {
          const val = initialScores[q.id] !== undefined ? String(initialScores[q.id]) : "";
          return (
            <TextField key={q.id} isRequired name={`q_${q.id}`} className="form-group" style={{ marginBottom: 0 }}>
              <Label className="form-label">
                {q.label} <span style={{ color: "var(--brand-red)" }}>*</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={q.maxPoints}
                className="input-field"
                placeholder={`Enter score from 0 to ${q.maxPoints}`}
                defaultValue={val}
                required
              />
              <small style={{ color: "var(--muted)", marginTop: 4, display: "block" }}>
                Maximum allowable points: {q.maxPoints}
              </small>
            </TextField>
          );
        })}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Button type="submit" name="status" value="DRAFT" className="button-secondary" style={{ minWidth: 140 }}>
          💾 Save as Draft
        </Button>
        <Button type="submit" name="status" value="SUBMITTED" className="button-primary" style={{ minWidth: 140 }}>
          ✔️ Submit Evaluation
        </Button>
      </div>
    </Form>
  );
}
