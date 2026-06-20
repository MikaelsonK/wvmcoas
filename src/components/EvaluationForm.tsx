"use client";

import { useActionState } from "react";
import { Form, TextField, Label, Input, Button, FieldError } from "react-aria-components";
import { submitEvaluation, FormState } from "@/app/evaluator/actions";

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

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

export function EvaluationForm({
  residentId,
  periodId,
  formId,
  evaluationId,
  questions,
  initialScores,
}: EvaluationFormProps) {
  const [state, action, isPending] = useActionState(submitEvaluation, {} as FormState);

  return (
    <Form action={action} validationErrors={state.errors} className="flex flex-col gap-5">
      {state.message && (
        <div role="alert" className="px-3 py-2 text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {state.message}
        </div>
      )}
      {state.success && (
        <div role="status" className="px-3 py-2 text-[12.5px] text-green-700 bg-green-50 border border-green-200 rounded-lg">
          Evaluation saved successfully. Redirecting…
        </div>
      )}

      <input type="hidden" name="residentId" value={residentId} />
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="formId" value={formId} />
      {evaluationId && <input type="hidden" name="evaluationId" value={evaluationId} />}

      <div className="flex flex-col gap-4 border border-gray-200 rounded-xl p-5 bg-white">
        {questions.map((q) => {
          const val = initialScores[q.id] !== undefined ? String(initialScores[q.id]) : "";
          return (
            <TextField key={q.id} isRequired name={`q_${q.id}`} className="flex flex-col gap-1.5">
              <Label className={labelClass}>
                {q.label} <span className="text-brand-red">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={q.maxPoints}
                className={inputClass}
                placeholder={`Enter score from 0 to ${q.maxPoints}`}
                defaultValue={val}
              />
              <FieldError className={errorClass} />
              <span className="text-[11px] text-gray-400 mt-0.5">
                Maximum allowable points: <span className="font-semibold text-gray-600">{q.maxPoints}</span>
              </span>
            </TextField>
          );
        })}
      </div>

      <div className="flex gap-3 mt-2">
        <Button
          type="submit"
          name="status"
          value="DRAFT"
          isDisabled={isPending}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150 cursor-default text-center"
        >
          💾 Save as Draft
        </Button>
        <Button
          type="submit"
          name="status"
          value="SUBMITTED"
          isDisabled={isPending}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default text-center"
        >
          ✔️ Submit Evaluation
        </Button>
      </div>
    </Form>
  );
}
