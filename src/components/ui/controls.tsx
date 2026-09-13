"use client";

import { AlertCircle, AlertTriangle, ChevronDown, RotateCcw } from "lucide-react";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* -------------------------------------------------------------------------- */
/* Shared styles                                                              */
/* -------------------------------------------------------------------------- */

const FIELD_BASE =
  "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400";
const FIELD = `${FIELD_BASE} border-[var(--ui-line)] bg-white text-[var(--ui-text)] focus:border-blue-500 focus:ring-blue-500/20`;

export const BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const BUTTON_PRIMARY = `${BUTTON} bg-gray-900 text-white hover:bg-gray-800`;
export const BUTTON_SECONDARY = `${BUTTON} border border-[var(--ui-line)] bg-white text-[var(--ui-text)] hover:bg-gray-50`;
export const BUTTON_GHOST = `${BUTTON} text-[var(--ui-muted)] hover:bg-gray-100 hover:text-[var(--ui-text)]`;

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                              */
/* -------------------------------------------------------------------------- */

function FieldShell({
  label,
  hint,
  htmlFor,
  hintId,
  children,
  action,
  required,
  error,
  warning,
}: {
  label?: string;
  hint?: string;
  htmlFor: string;
  hintId: string;
  children: ReactNode;
  action?: ReactNode;
  required?: boolean;
  error?: string | null;
  warning?: string | null;
}) {
  return (
    <div className="min-w-0">
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-medium text-[var(--ui-muted)]">
            <span>{label}</span>
            {required && (
              <span className="text-red-500 font-bold" title="Required field">
                *
              </span>
            )}
          </label>
          <div className="flex items-center gap-1.5">
            {warning && !error && (
              <div className="group relative inline-flex items-center">
                <span
                  tabIndex={0}
                  className="inline-flex cursor-help items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200/80 transition-colors hover:bg-amber-100 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  aria-label={warning}
                  title={warning}
                >
                  <AlertTriangle className="size-3 shrink-0 text-amber-600" />
                  <span>May need change</span>
                </span>
                {/* Floating tooltip on hover/focus */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute right-0 bottom-full z-40 mb-1.5 hidden w-64 max-w-[85vw] rounded-md bg-gray-900 p-2 text-[11px] leading-snug font-normal text-white shadow-lg ring-1 ring-black/10 group-hover:block group-focus-within:block"
                >
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                    <span>{warning}</span>
                  </div>
                  <div className="absolute top-full right-4 -mt-px border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
            {action}
          </div>
        </div>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-xs text-[var(--ui-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text input                                                                 */
/* -------------------------------------------------------------------------- */

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label?: string;
  hint?: string;
  value: string;
  onValueChange: (value: string) => void;
  action?: ReactNode;
  required?: boolean;
  error?: string | null;
  warning?: string | null;
};

export function TextField({
  label,
  hint,
  value,
  onValueChange,
  action,
  required,
  error,
  warning,
  className = "",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  const stateClass = error
    ? "border-red-400 bg-red-50/20 text-[var(--ui-text)] focus:border-red-500 focus:ring-red-500/20"
    : warning
      ? "border-amber-400 bg-amber-50/20 text-[var(--ui-text)] focus:border-amber-500 focus:ring-amber-500/20"
      : "border-[var(--ui-line)] bg-white text-[var(--ui-text)] focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <FieldShell
      label={label}
      hint={hint}
      htmlFor={id}
      hintId={hintId}
      action={action}
      required={required}
      error={error}
      warning={warning}
    >
      <input
        {...rest}
        id={id}
        value={value}
        required={required}
        aria-required={required ? "true" : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => onValueChange(event.target.value)}
        aria-describedby={hint ? hintId : undefined}
        className={`${FIELD_BASE} ${stateClass} ${className}`}
      />
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  label?: string;
  hint?: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string | null;
  warning?: string | null;
};

export function TextAreaField({
  label,
  hint,
  value,
  onValueChange,
  rows = 3,
  required,
  error,
  warning,
  className = "",
  ...rest
}: TextAreaFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  const stateClass = error
    ? "border-red-400 bg-red-50/20 text-[var(--ui-text)] focus:border-red-500 focus:ring-red-500/20"
    : warning
      ? "border-amber-400 bg-amber-50/20 text-[var(--ui-text)] focus:border-amber-500 focus:ring-amber-500/20"
      : "border-[var(--ui-line)] bg-white text-[var(--ui-text)] focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <FieldShell
      label={label}
      hint={hint}
      htmlFor={id}
      hintId={hintId}
      required={required}
      error={error}
      warning={warning}
    >
      <textarea
        {...rest}
        id={id}
        rows={rows}
        value={value}
        required={required}
        aria-required={required ? "true" : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => onValueChange(event.target.value)}
        aria-describedby={hint ? hintId : undefined}
        className={`${FIELD_BASE} ${stateClass} resize-y ${className}`}
      />
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  label?: string;
  hint?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
};

export function SelectField({
  label,
  hint,
  value,
  onValueChange,
  options,
  className = "",
  ...rest
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <FieldShell label={label} hint={hint} htmlFor={id} hintId={hintId}>
      <div className="relative">
        <select
          {...rest}
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={hint ? hintId : undefined}
          className={`${FIELD} cursor-pointer appearance-none pr-9 ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented control                                                          */
/* -------------------------------------------------------------------------- */

export function Segmented<T extends string>({
  label,
  value,
  onValueChange,
  options,
  size = "md",
}: {
  label?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="min-w-0">
      {label && (
        <div className="mb-1.5 text-xs font-medium text-[var(--ui-muted)]" role="presentation">
          {label}
        </div>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex gap-1 rounded-lg border border-[var(--ui-line)] bg-gray-50 p-1"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onValueChange(option.value)}
              className={`flex-1 cursor-pointer rounded-md font-medium transition-colors ${pad} ${
                active
                  ? "bg-white text-[var(--ui-text)] shadow-sm"
                  : "text-[var(--ui-muted)] hover:text-[var(--ui-text)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

export function Checkbox({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}: {
  label: ReactNode;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        aria-describedby={hint ? hintId : undefined}
        className="mt-0.5 size-4.5 cursor-pointer rounded border-[var(--ui-line)] text-gray-900 accent-gray-900 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--ui-text)]">{label}</div>
        {hint && (
          <p id={hintId} className="mt-0.5 text-xs text-[var(--ui-muted)]">
            {hint}
          </p>
        )}
      </div>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                     */
/* -------------------------------------------------------------------------- */

export function Switch({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const hintId = useId();
  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        if (!disabled) onCheckedChange(!checked);
      }}
      className={`flex items-start justify-between gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--ui-text)]">{label}</div>
        {hint && (
          <p id={hintId} className="mt-0.5 text-xs text-[var(--ui-muted)]">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-gray-900" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Colour field                                                               */
/* -------------------------------------------------------------------------- */

const SWATCHES = [
  "#B91C1C",
  "#C2410C",
  "#B45309",
  "#15803D",
  "#0F766E",
  "#1D4ED8",
  "#4338CA",
  "#7E22CE",
  "#BE185D",
  "#111827",
];

export function ColorField({
  label,
  value,
  onValueChange,
  swatches = SWATCHES,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  swatches?: string[];
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = useId();

  const commit = (next: string) => {
    const candidate = next.startsWith("#") ? next : `#${next}`;
    if (/^#[0-9a-fA-F]{6}$/.test(candidate)) {
      onValueChange(candidate.toUpperCase());
      setDraft(null);
    } else {
      setDraft(next);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[var(--ui-muted)]">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => {
            setDraft(null);
            onValueChange(event.target.value.toUpperCase());
          }}
          aria-label={`${label} colour picker`}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-[var(--ui-line)] bg-white p-1"
        />
        <input
          id={id}
          value={draft ?? value}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setDraft(null)}
          spellCheck={false}
          className={`${FIELD} font-mono text-xs uppercase`}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {swatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onValueChange(swatch)}
            aria-label={`Use ${swatch}`}
            aria-pressed={swatch.toUpperCase() === value.toUpperCase()}
            style={{ background: swatch }}
            className={`size-6 cursor-pointer rounded-md ring-1 ring-black/10 transition-transform hover:scale-110 ${
              swatch.toUpperCase() === value.toUpperCase()
                ? "ring-2 ring-gray-900 ring-offset-2"
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                     */
/* -------------------------------------------------------------------------- */

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-[var(--ui-muted)]">
          {label}
        </label>
        <span className="text-xs tabular-nums text-[var(--ui-muted)]">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-gray-900"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accordion                                                                  */
/* -------------------------------------------------------------------------- */

export function Accordion({
  title,
  description,
  icon,
  defaultOpen = false,
  isOpen,
  onOpenChange,
  onReset,
  errorCount = 0,
  warningCount = 0,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReset?: () => void;
  errorCount?: number;
  warningCount?: number;
  children: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const panelId = useId();

  const borderClass =
    errorCount > 0
      ? "border-red-300 ring-1 ring-red-300/50"
      : warningCount > 0
        ? "border-amber-300 ring-1 ring-amber-300/50"
        : "border-[var(--ui-line)]";

  return (
    <section className={`overflow-hidden rounded-xl border ${borderClass} bg-white transition-colors`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
        >
          {icon && <span className="shrink-0 text-[var(--ui-muted)]">{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">{title}</span>
              {errorCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  {errorCount} required
                </span>
              )}
              {warningCount > 0 && errorCount === 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  {warningCount} needs update
                </span>
              )}
            </span>
            {description && (
              <span className="block truncate text-xs text-[var(--ui-muted)]">{description}</span>
            )}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {onReset && open && (
          <button
            type="button"
            onClick={onReset}
            title={`Reset ${title.toLowerCase()}`}
            aria-label={`Reset ${title.toLowerCase()}`}
            className="mr-2 cursor-pointer rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-[var(--ui-text)]"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div id={panelId} className="border-t border-[var(--ui-line)] px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout helpers                                                             */
/* -------------------------------------------------------------------------- */

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 }) {
  return (
    <div className={`grid gap-3 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
  );
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-[var(--ui-line)]" />;
  return (
    <div className="flex items-center gap-3">
      <hr className="flex-1 border-[var(--ui-line)]" />
      <span className="text-xs font-medium tracking-wide text-[var(--ui-muted)] uppercase">
        {label}
      </span>
      <hr className="flex-1 border-[var(--ui-line)]" />
    </div>
  );
}
