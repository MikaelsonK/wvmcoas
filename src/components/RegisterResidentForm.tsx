"use client";

import { useActionState } from "react";
import { Form, TextField, Label, Input, Button, FieldError } from "react-aria-components";
import { registerResident, FormState } from "@/app/admin/residents/actions";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

export function RegisterResidentForm() {
  const [state, action, isPending] = useActionState(registerResident, {} as FormState);

  return (
    <Form action={action} validationErrors={state.errors} className="flex flex-col gap-3">
      {state.message && (
        <div role="alert" className="px-3 py-2 text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {state.message}
        </div>
      )}
      {state.success && (
        <div role="status" className="px-3 py-2 text-[12.5px] text-green-700 bg-green-50 border border-green-200 rounded-lg">
          Resident registered successfully.
        </div>
      )}

      <TextField isRequired name="name" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Full Name</Label>
        <Input className={inputClass} placeholder="e.g. Dr. Galahad Vance" />
        <FieldError className={errorClass} />
      </TextField>

      <TextField isRequired type="email" name="email" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Email Address</Label>
        <Input className={inputClass} placeholder="e.g. galahad@hospital.com" />
        <FieldError className={errorClass} />
      </TextField>

      <div className="flex gap-3">
        <TextField isRequired name="yearLevel" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Year Level</Label>
          <Input type="number" min={1} max={10} className={inputClass} placeholder="1" />
          <FieldError className={errorClass} />
        </TextField>

        <TextField name="contactNo" className="flex-1 flex flex-col gap-1.5">
          <Label className={labelClass}>Contact No.</Label>
          <Input className={inputClass} placeholder="+63917…" />
          <FieldError className={errorClass} />
        </TextField>
      </div>

      <TextField isRequired type="password" name="password" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Temporary Password</Label>
        <Input minLength={6} className={inputClass} placeholder="••••••••" />
        <FieldError className={errorClass} />
      </TextField>

      <Button
        type="submit"
        isDisabled={isPending}
        className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default"
      >
        {isPending ? "Registering…" : "Add Resident"}
      </Button>
    </Form>
  );
}
