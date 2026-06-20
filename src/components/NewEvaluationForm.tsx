"use client";

import { Form, Label, Button, Select, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";

const selectButtonClass = "w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50";
const labelClass = "text-[12.5px] font-semibold text-gray-600";

interface ResidentOption {
  id: string;
  name: string;
}

interface PeriodOption {
  id: string;
  name: string;
}

interface FormOption {
  id: string;
  title: string;
}

interface NewEvaluationFormProps {
  residents: ResidentOption[];
  periods: PeriodOption[];
  forms: FormOption[];
}

export function NewEvaluationForm({ residents, periods, forms }: NewEvaluationFormProps) {
  return (
    <Form method="get" action="/evaluator/new/fill" className="flex flex-col gap-4">
      <Select isRequired name="residentId" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Resident Doctor</Label>
        <Button className={selectButtonClass}>
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Select resident…
            </ListBoxItem>
            {residents.map((r) => (
              <ListBoxItem key={r.id} id={r.id} className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                {r.name}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </Select>

      <Select isRequired name="periodId" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Evaluation Period</Label>
        <Button className={selectButtonClass}>
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Select period…
            </ListBoxItem>
            {periods.map((p) => (
              <ListBoxItem key={p.id} id={p.id} className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                {p.name}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </Select>

      <Select isRequired name="formId" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Assessment Form</Label>
        <Button className={selectButtonClass}>
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Select form…
            </ListBoxItem>
            {forms.map((f) => (
              <ListBoxItem key={f.id} id={f.id} className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                {f.title}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </Select>

      <button
        type="submit"
        className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors duration-150 cursor-pointer"
      >
        Load Form
      </button>
    </Form>
  );
}
