"use client";

import { useActionState, useEffect, useRef } from "react";
import { Form, TextField, Label, Input, Button, FieldError } from "react-aria-components";
import { createCategory, FormState } from "@/app/admin/procedures/actions";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

export function CreateCategoryForm() {
  const [state, action, isPending] = useActionState(createCategory, {} as FormState);
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
          Category created successfully.
        </div>
      )}

      <TextField isRequired name="name" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Category Name</Label>
        <Input className={inputClass} placeholder="e.g. Major Surgery" />
        <FieldError className={errorClass} />
      </TextField>

      <Button
        type="submit"
        isDisabled={isPending}
        className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default"
      >
        {isPending ? "Adding…" : "Add Category"}
      </Button>
    </Form>
  );
}
