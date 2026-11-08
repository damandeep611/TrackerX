"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Controlled convenience wrapper around `ui/dialog` (same props as the old
 * hand-rolled modal). Prefer composing `Dialog` directly in new code.
 */
export default function Modal({ isOpen, onClose, title, description, className, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        <DialogHeader className={title ? undefined : "sr-only"}>
          <DialogTitle>{title ?? "Dialog"}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title ?? "Dialog"}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
