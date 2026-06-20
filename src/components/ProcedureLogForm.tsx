"use client";

import { useActionState, useEffect, useRef } from "react";
import { Form, TextField, Label, Input, Button, FieldError, Select, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";
import { createProcedureLog, FormState } from "@/app/resident/procedures/actions";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

interface ProcedureOption {
  id: string;
  name: string;
  typeName: string;
}

interface ProcedureLogFormProps {
  procedures: ProcedureOption[];
}

export function ProcedureLogForm({ procedures }: ProcedureLogFormProps) {
  const [state, action, isPending] = useActionState(createProcedureLog, {} as FormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <Form ref={formRef} action={action} validationErrors={state.errors} className="flex flex-col gap-3">
      {state.message && (
        <div role="alert" className="px-3 py-2 text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {state.message}
        </div>
      )}
      {state.success && (
        <div role="status" className="px-3 py-2 text-[12.5px] text-green-700 bg-green-50 border border-green-200 rounded-lg">
          Procedure logged successfully.
        </div>
      )}

      <Select isRequired name="procedureId" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Select Procedure</Label>
        <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Choose procedure...
            </ListBoxItem>
            {procedures.map((p) => (
              <ListBoxItem key={p.id} id={p.id} className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                {p.name} ({p.typeName})
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
        <FieldError className={errorClass} />
      </Select>

      <TextField isRequired name="patientHRN" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Patient HRN (Hospital Record Number)</Label>
        <Input className={inputClass} placeholder="e.g. HRN-12345" />
        <FieldError className={errorClass} />
      </TextField>

      <TextField name="patientName" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Patient Name (Optional)</Label>
        <Input className={inputClass} placeholder="e.g. Jane Doe" />
        <FieldError className={errorClass} />
      </TextField>

      <div className="flex gap-3 items-start">
        <TextField name="patientAge" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Patient Age (Optional)</Label>
          <Input type="number" min={0} className={inputClass} placeholder="30" />
          <FieldError className={errorClass} />
        </TextField>
        
        <Select name="patientGender" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Gender (Optional)</Label>
          <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
            <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
            <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
          </Button>
          <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
            <ListBox className="p-1 focus:outline-none">
              <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                Select...
              </ListBoxItem>
              <ListBoxItem id="Male" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                Male
              </ListBoxItem>
              <ListBoxItem id="Female" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                Female
              </ListBoxItem>
              <ListBoxItem id="Other" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                Other
              </ListBoxItem>
            </ListBox>
          </Popover>
          <FieldError className={errorClass} />
        </Select>
      </div>

      <Select isRequired name="status" defaultSelectedKey="COMPLETED" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Supervision Status</Label>
        <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="COMPLETED" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Completed (Independent)
            </ListBoxItem>
            <ListBoxItem id="SUPERVISED" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Supervised (Under Consultant)
            </ListBoxItem>
          </ListBox>
        </Popover>
        <FieldError className={errorClass} />
      </Select>

      <Button
        type="submit"
        isDisabled={isPending}
        className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default"
      >
        {isPending ? "Logging…" : "Log Procedure"}
      </Button>
    </Form>
  );
}
