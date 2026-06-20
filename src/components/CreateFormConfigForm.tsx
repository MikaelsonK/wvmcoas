"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Form, TextField, Label, Input, Button, FieldError, Select, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";
import { createForm, FormState } from "@/app/admin/forms/actions";
import { DialogModal } from "@/components/DialogModal";

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";
const labelClass = "text-[12.5px] font-semibold text-gray-600";
const errorClass = "text-xs text-red-600 mt-1 block font-medium";

interface DomainOption {
  id: string;
  name: string;
}

export function CreateFormConfigForm({ domains, onSuccess }: { domains: DomainOption[]; onSuccess?: () => void }) {
  const [state, action, isPending] = useActionState(createForm, {} as FormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      if (onSuccess) {
        const timer = setTimeout(() => {
          onSuccess();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.success, onSuccess]);

  return (
    <Form ref={formRef} action={action} validationErrors={state.errors} className="flex flex-col gap-4">
      {state.message && (
        <div role="alert" className="px-3 py-2 text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {state.message}
        </div>
      )}
      {state.success && (
        <div role="status" className="px-3 py-2 text-[12.5px] text-green-700 bg-green-50 border border-green-200 rounded-lg">
          Evaluation form created successfully.
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <TextField isRequired name="title" className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <Label className={labelClass}>Form Title</Label>
          <Input className={inputClass} placeholder="e.g. End of Rotation Assessment" />
          <FieldError className={errorClass} />
        </TextField>

        <Select name="domainId" className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <Label className={labelClass}>Map to Domain (Optional)</Label>
          <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer text-left data-[hovered]:bg-gray-100/50">
            <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
            <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
          </Button>
          <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
            <ListBox className="p-1 focus:outline-none">
              <ListBoxItem id="" className="cursor-pointer rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                None / Unmapped
              </ListBoxItem>
              {domains.map((d) => (
                <ListBoxItem key={d.id} id={d.id} className="cursor-pointer rounded px-2.5 py-2 text-sm outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                  {d.name}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
          <FieldError className={errorClass} />
        </Select>
      </div>

      <div>
        <p className={`${labelClass} mb-3`}>Questions (up to 5)</p>
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 flex-wrap items-start px-4 py-3 bg-gray-50/50">
              <TextField name={`qLabel_${i}`} className="flex-[2] min-w-[180px] flex flex-col gap-1">
                <Label className="text-[11.5px] font-medium text-gray-500 font-semibold">Q{i + 1} Label</Label>
                <Input placeholder="e.g. Surgical skills" className={inputClass} />
                <FieldError className={errorClass} />
              </TextField>
              
              <TextField name={`qMax_${i}`} className="w-24 flex flex-col gap-1">
                <Label className="text-[11.5px] font-medium text-gray-500 font-semibold">Max Pts</Label>
                <Input type="number" min={1} max={100} placeholder="10" className={inputClass} />
                <FieldError className={errorClass} />
              </TextField>

              <TextField name={`qWeight_${i}`} className="w-24 flex flex-col gap-1">
                <Label className="text-[11.5px] font-medium text-gray-500 font-semibold">Weight</Label>
                <Input type="number" step="0.01" placeholder="1.0" className={inputClass} />
                <FieldError className={errorClass} />
              </TextField>

              <Select name={`qType_${i}`} defaultSelectedKey="single_select" className="w-52 flex flex-col gap-1">
                <Label className="text-[11.5px] font-medium text-gray-500 font-semibold">Type</Label>
                <Button className="w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer text-left data-[hovered]:bg-gray-100/50">
                  <SelectValue className="block truncate data-[placeholder]:text-gray-400" />
                  <span aria-hidden="true" className="text-gray-400 text-xs">▼</span>
                </Button>
                <Popover className="w-[var(--trigger-width)] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
                  <ListBox className="p-1 focus:outline-none">
                    <ListBoxItem id="single_select" className="cursor-pointer rounded px-2.5 py-2 text-[13px] outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                      Single Select (Numeric)
                    </ListBoxItem>
                    <ListBoxItem id="multi_select" className="cursor-pointer rounded px-2.5 py-2 text-[13px] outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                      Multi Select
                    </ListBoxItem>
                    <ListBoxItem id="text" className="cursor-pointer rounded px-2.5 py-2 text-[13px] outline-none data-[focused]:bg-gray-100 data-[selected]:bg-brand-red data-[selected]:text-white text-gray-800 transition-colors duration-100">
                      Text Response
                    </ListBoxItem>
                  </ListBox>
                </Popover>
                <FieldError className={errorClass} />
              </Select>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        isDisabled={isPending}
        className="self-start px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-pointer text-center outline-none"
      >
        {isPending ? "Creating…" : "Create Form"}
      </Button>
    </Form>
  );
}

export function CreateFormConfigModalTrigger({ domains }: { domains: DomainOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onPress={() => setIsOpen(true)}
        className="px-4 py-2 text-[12.5px] font-semibold text-white bg-brand-red rounded-lg hover:bg-[#8a0606] transition-colors outline-none cursor-pointer flex items-center justify-center"
      >
        + Create Form
      </Button>

      <DialogModal isOpen={isOpen} onOpenChange={setIsOpen} title="Create Evaluation Form">
        <div className="max-h-[85vh] overflow-y-auto pr-1">
          <CreateFormConfigForm domains={domains} onSuccess={() => setIsOpen(false)} />
        </div>
      </DialogModal>
    </>
  );
}
