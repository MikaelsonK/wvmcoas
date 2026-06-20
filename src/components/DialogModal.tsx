"use client";

import React from "react";
import { ModalOverlay, Modal as RACModal, Dialog, Heading, Button } from "react-aria-components";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function DialogModal({ isOpen, onOpenChange, title, children }: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity duration-200"
    >
      <RACModal
        className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-5 shadow-xl transition-all duration-200 border border-gray-100 outline-none"
      >
        <Dialog className="outline-none relative">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <Heading slot="title" className="text-[14px] font-bold text-gray-900">
              {title}
            </Heading>
            <Button
              onPress={() => onOpenChange(false)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors outline-none cursor-pointer flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X size={15} />
            </Button>
          </div>
          <div className="mt-1">
            {children}
          </div>
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
}
