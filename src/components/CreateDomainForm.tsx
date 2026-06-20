"use client";

import { useActionState, useEffect, useRef } from "react";
import { Form, TextField, Label, Input, Button, FieldError, Select, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";
import { createDomain, FormState } from "@/app/admin/domains/actions";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

interface DomainOption {
  id: string;
  name: string;
}

export function CreateDomainForm({ domains }: { domains: DomainOption[] }) {
  const [state, action, isPending] = useActionState(createDomain, {} as FormState);
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
          Domain created successfully.
        </div>
      )}

      <TextField isRequired name="name" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Domain Name</Label>
        <Input className={inputClass} placeholder="e.g. Patient Care & Safety" />
        <FieldError className={errorClass} />
      </TextField>

      <Select name="parentId" className="flex flex-col gap-1.5">
        <Label className={labelClass}>Parent Domain (Optional)</Label>
        <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-default text-left data-[hovered]:bg-gray-100/50">
          <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
          <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
        </Button>
        <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <ListBox className="p-1 focus:outline-none">
            <ListBoxItem id="" className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
              None (Make Root)
            </ListBoxItem>
            {domains.map((d) => (
              <ListBoxItem key={d.id} id={d.id} className="cursor-default rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                {d.name}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
        <FieldError className={errorClass} />
      </Select>

      <Button
        type="submit"
        isDisabled={isPending}
        className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default"
      >
        {isPending ? "Adding…" : "Add Domain"}
      </Button>
    </Form>
  );
}
