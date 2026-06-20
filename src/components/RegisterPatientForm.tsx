"use client";

import { useActionState } from "react";
import { Form, TextField, Label, Input, Button, FieldError, Select, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";
import { registerPatient, FormState } from "@/app/admin/patients/actions";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

export function RegisterPatientForm() {
  const [state, action, isPending] = useActionState(registerPatient, {} as FormState);

  return (
    <Form action={action} validationErrors={state.errors} className="flex flex-col gap-3">
      {state.message && (
        <div role="alert" className="px-3 py-2 text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {state.message}
        </div>
      )}
      {state.success && (
        <div role="status" className="px-3 py-2 text-[12.5px] text-green-700 bg-green-50 border border-green-200 rounded-lg">
          Patient registered successfully.
        </div>
      )}

      <TextField isRequired name="hrn" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Patient HRN</Label>
        <Input className={inputClass} placeholder="e.g. HRN-99887" />
        <FieldError className={errorClass} />
      </TextField>

      <TextField isRequired name="name" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Full Name</Label>
        <Input className={inputClass} placeholder="e.g. Jane Doe" />
        <FieldError className={errorClass} />
      </TextField>

      <div className="flex gap-3 items-start">
        <TextField isRequired name="age" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Age</Label>
          <Input type="number" min={0} className={inputClass} placeholder="32" />
          <FieldError className={errorClass} />
        </TextField>

        <Select isRequired name="gender" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Gender</Label>
          <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
            <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
            <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
          </Button>
          <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
            <ListBox className="p-1 focus:outline-none">
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

      <Select name="civilStatus" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Civil Status</Label>
        <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Select…
            </ListBoxItem>
            <ListBoxItem id="Single" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Single
            </ListBoxItem>
            <ListBoxItem id="Married" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Married
            </ListBoxItem>
            <ListBoxItem id="Separated" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Separated
            </ListBoxItem>
            <ListBoxItem id="Widowed" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              Widowed
            </ListBoxItem>
          </ListBox>
        </Popover>
        <FieldError className={errorClass} />
      </Select>

      <TextField name="email" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Email Address</Label>
        <Input type="email" className={inputClass} placeholder="e.g. jane.doe@example.com" />
        <FieldError className={errorClass} />
      </TextField>

      <Button
        type="submit"
        isDisabled={isPending}
        className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default"
      >
        {isPending ? "Registering…" : "Register Patient"}
      </Button>
    </Form>
  );
}
