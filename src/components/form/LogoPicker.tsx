"use client";

import { AlertCircle, ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { BUTTON_GHOST, BUTTON_SECONDARY } from "@/components/ui/controls";
import { env } from "@/config/defaults";

const MAX_BYTES = 1024 * 1024; // 1 MB — keeps the localStorage draft well under quota
const ACCEPTED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"];

/**
 * Logo chooser. The file is read into a data URL and lives only in state (and,
 * if drafts are on, in localStorage) — it is never uploaded anywhere.
 */
export function LogoPicker({
  value,
  onChange,
  required = false,
  error: externalError = null,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG, SVG, WebP or GIF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That file is ${Math.round(file.size / 1024)} KB. Keep it under 1 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError("Could not read that file.");
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isCustom = value.startsWith("data:");
  const isDefault = Boolean(env.logoUrl) && value === env.logoUrl;
  const activeError = error || (!value ? externalError : null);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium text-[var(--ui-muted)]">
          <span>University logo</span>
          {required && (
            <span className="text-red-500 font-bold" title="Required field">
              *
            </span>
          )}
        </span>
      </div>

      <div
        className={`flex items-center gap-3 rounded-lg border ${
          activeError ? "border-red-400 bg-red-50/20" : "border-[var(--ui-line)] bg-gray-50"
        } p-3`}
      >
        <div className={`flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border ${activeError ? "border-red-300" : "border-[var(--ui-line)]"} bg-white`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
            <img src={value} alt="" className="size-full object-contain p-1" />
          ) : (
            <ImageUp className="size-5 text-gray-300" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`${BUTTON_SECONDARY} px-3 py-1.5 text-xs`}
            >
              <ImageUp className="size-3.5" />
              {value ? "Replace" : "Upload"}
            </button>

            {env.logoUrl && !isDefault && (
              <button
                type="button"
                onClick={() => onChange(env.logoUrl)}
                className={`${BUTTON_GHOST} px-2 py-1.5 text-xs`}
              >
                <RotateCcw className="size-3.5" />
                Default
              </button>
            )}

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className={`${BUTTON_GHOST} px-2 py-1.5 text-xs`}
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            )}
          </div>

          <p className="mt-1.5 text-xs text-[var(--ui-muted)]">
            {isCustom
              ? "Your own logo, stored in this browser only."
              : "PNG or SVG, square works best. Stays on your device."}
          </p>
        </div>
      </div>

      {activeError && (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Allow re-picking the same file after a failed attempt.
          event.target.value = "";
        }}
      />
    </div>
  );
}
