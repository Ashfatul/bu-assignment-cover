"use client";

import { AlertTriangle, ArrowRight, Edit3 } from "lucide-react";

import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/ui/controls";
import { Dialog } from "@/components/ui/Dialog";
import type { ValidationReport } from "@/lib/validation";

export function UnchangedDefaultsDialog({
  open,
  onClose,
  onProceed,
  validation,
  actionType,
}: {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  validation: ValidationReport;
  actionType: "print" | "download" | "email";
}) {
  const actionLabel = {
    print: "Print / Save PDF",
    download: "Download PDF",
    email: "Send Email",
  }[actionType];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Unchanged Default Values Detected"
      description="The following fields still have default sample values from the reference assignment:"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${BUTTON_SECONDARY} text-xs`}>
            <Edit3 className="size-3.5" />
            Review &amp; Edit Fields
          </button>
          <button
            type="button"
            onClick={onProceed}
            className={`${BUTTON_PRIMARY} bg-amber-600 text-xs hover:bg-amber-700`}
          >
            <span>Proceed with {actionLabel}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            These fields are specific to each assignment. If this is a new submission, verify that
            you have updated the course title, code, topic, date, and instructor.
          </span>
        </div>

        <ul className="flex flex-col gap-2 divide-y divide-[var(--ui-line)]">
          {Object.entries(validation.warnings).map(([key, msg]) => (
            <li key={key} className="text-xs pt-2 first:pt-0">
              <span className="block font-semibold capitalize text-gray-900">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <span className="text-amber-700">{msg}</span>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
