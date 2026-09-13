"use client";

import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

import { Dialog } from "@/components/ui/Dialog";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  TextAreaField,
  TextField,
} from "@/components/ui/controls";
import { useToast } from "@/components/ui/Toast";
import { suggestedFilename } from "@/lib/cover-model";
import { coverToPdfBlob, formatBytes } from "@/lib/pdf";
import type { CoverState } from "@/lib/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function EmailDialog({
  open,
  onClose,
  state,
  coverRef,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  state: CoverState;
  coverRef: RefObject<HTMLDivElement | null>;
  onSent: () => void;
}) {
  const { show } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState<"building" | "sending" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filename = suggestedFilename(state.data);

  // Prefill the subject from the cover whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setError(null);
    const { document: doc, student } = state.data;
    const parts = [doc.courseCode, doc.type, student.name].map((p) => p.trim()).filter(Boolean);
    setSubject(parts.join(" — ") || "Assignment cover");
  }, [open, state.data]);

  const send = async () => {
    setError(null);

    if (!EMAIL_RE.test(to.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    const node = coverRef.current;
    if (!node) {
      setError("The preview isn't ready yet. Close this and try again.");
      return;
    }

    try {
      setBusy("building");
      const blob = await coverToPdfBlob(node, state.settings.layout.paper);

      setBusy("sending");
      const form = new FormData();
      form.set("to", to.trim());
      form.set("subject", subject.trim() || "Assignment cover");
      form.set("message", message);
      form.set("filename", filename);
      form.set("nickname", honeypot);
      form.set("file", new File([blob], filename, { type: "application/pdf" }));

      const response = await fetch("/api/send", { method: "POST", body: form });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not send the email.");
        return;
      }

      show({
        tone: "success",
        message: `Cover sent to ${to.trim()} (${formatBytes(blob.size)}).`,
      });
      setTo("");
      setMessage("");
      onClose();
      onSent();
    } catch {
      setError("Could not build or send the PDF. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Email this cover"
      description="The cover is rendered to a PDF in your browser and sent once. Nothing is stored on the server."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(busy)}
            className={BUTTON_SECONDARY}
          >
            Cancel
          </button>
          <button type="button" onClick={send} disabled={Boolean(busy)} className={BUTTON_PRIMARY}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            {busy === "building" ? "Building PDF…" : busy === "sending" ? "Sending…" : "Send"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Send to"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="instructor@university.edu"
          value={to}
          onValueChange={setTo}
        />

        <TextField label="Subject" value={subject} onValueChange={setSubject} />

        <TextAreaField
          label="Message (optional)"
          placeholder="Sir, please find my assignment cover attached."
          value={message}
          onValueChange={setMessage}
          rows={3}
        />

        {/* Honeypot: real people never see or fill this. */}
        <input
          type="text"
          name="nickname"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] size-px opacity-0"
        />

        <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-[var(--ui-muted)]">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
          <span>
            Attachment: <span className="font-mono">{filename}</span>. The message is relayed
            through this site&apos;s mail server and never written to disk or a database.
          </span>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
