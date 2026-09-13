"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "info" | "success" | "error";

type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
  action?: { label: string; onClick: () => void };
  duration: number;
};

type ToastInput = Omit<Toast, "id" | "duration"> & { duration?: number };

const ToastContext = createContext<{ show: (toast: ToastInput) => void } | null>(null);

const ICONS: Record<ToastTone, ReactNode> = {
  info: <Info className="size-4 shrink-0 text-blue-600" />,
  success: <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />,
  error: <TriangleAlert className="size-4 shrink-0 text-red-600" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    seq.current += 1;
    const toast: Toast = { id: seq.current, duration: 5000, ...input };
    setToasts((prev) => [...prev.slice(-2), toast]);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 print:hidden"
      >
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-[var(--ui-line)] bg-white px-4 py-3 shadow-lg">
      {ICONS[toast.tone]}
      <span className="min-w-0 flex-1 text-sm">{toast.message}</span>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
