"use client";

import { Download, Loader2, Mail, Printer } from "lucide-react";
import { useState, type RefObject } from "react";

import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
} from "@/components/ui/controls";
import { useToast } from "@/components/ui/Toast";
import { suggestedFilename } from "@/lib/cover-model";
import { coverToPdfBlob, downloadBlob } from "@/lib/pdf";
import type { CoverState } from "@/lib/schema";

export function ActionBar({
  state,
  coverRef,
  onPrint,
  onEmail,
  emailAvailable,
  compact = false,
}: {
  state: CoverState;
  coverRef: RefObject<HTMLDivElement | null>;
  onPrint: () => void;
  onEmail: () => void;
  /** null while we're still asking the server whether SMTP is configured. */
  emailAvailable: boolean | null;
  compact?: boolean;
}) {
  const { show } = useToast();
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    const node = coverRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      const blob = await coverToPdfBlob(node, state.settings.layout.paper);
      downloadBlob(blob, suggestedFilename(state.data));
      show({
        tone: "info",
        message: "Downloaded. For sharper text, use Print → Save as PDF instead.",
      });
    } catch {
      show({ tone: "error", message: "Could not build the PDF. Try the print dialog." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
      <button type="button" onClick={onPrint} className={`${BUTTON_PRIMARY} flex-1 sm:flex-none`}>
        <Printer className="size-4" />
        Print / Save PDF
      </button>

      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className={BUTTON_SECONDARY}
        title="Download a PDF file directly (image-based)"
      >
        {downloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        <span className={compact ? "sr-only" : ""}>PDF</span>
      </button>

      <button
        type="button"
        onClick={onEmail}
        disabled={emailAvailable === false}
        className={BUTTON_SECONDARY}
        title={
          emailAvailable === false
            ? "Email is not configured on this deployment (set SMTP_* in .env.local)"
            : "Email this cover as a PDF"
        }
      >
        <Mail className="size-4" />
        <span className={compact ? "sr-only" : ""}>Email</span>
      </button>
    </div>
  );
}
