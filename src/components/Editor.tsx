"use client";

import {
  ChevronDown,
  ChevronUp,
  FileText,
  Maximize2,
  PanelRightOpen,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ActionBar } from "@/components/actions/ActionBar";
import { EmailDialog } from "@/components/actions/EmailDialog";
import { AdvancedPanel } from "@/components/form/AdvancedPanel";
import {
  DatesSection,
  DocumentSection,
  InstitutionSection,
  StudentSection,
  TeacherSection,
} from "@/components/form/sections";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { BUTTON_GHOST, Segmented } from "@/components/ui/controls";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { env, sampleState } from "@/config/defaults";
import { clearHash, readSettingsFromHash } from "@/lib/share";
import type { CoverState } from "@/lib/schema";
import { CoverStoreProvider, useCoverStore } from "@/lib/store";
import { readDraft, readDraftEnabled, useLocalDraft } from "@/lib/useLocalDraft";
import { usePrint } from "@/lib/usePrint";

export function Editor() {
  return (
    <ToastProvider>
      <CoverStoreProvider>
        <EditorShell />
      </CoverStoreProvider>
    </ToastProvider>
  );
}

type MobileView = "edit" | "preview";

function EditorShell() {
  const { state, replaceState, resetAll } = useCoverStore();
  const { show } = useToast();

  const draft = useLocalDraft(state);
  const coverRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [mobileView, setMobileView] = useState<MobileView>("edit");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(
    env.emailEnabled ? null : false,
  );

  /* ---- restore draft + style link, once, after mount ------------------- */
  useEffect(() => {
    // `draft.enabled` is still the env default on this first render, so read the
    // stored preference directly — a draft left behind by a since-disabled
    // toggle must not come back.
    const record = readDraftEnabled() ? readDraft() : null;
    const shared = readSettingsFromHash();
    if (!record && !shared) return;

    const base = record?.state ?? stateRef.current;
    replaceState(shared ? { ...base, settings: shared } : base);

    if (shared) {
      clearHash();
      show({ tone: "info", message: "Style applied from the shared link." });
    } else {
      show({ tone: "info", message: "Draft restored from this browser." });
    }
    // Intentionally runs once; later changes are handled by useLocalDraft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- is email configured on this deployment? ------------------------- */
  useEffect(() => {
    if (!env.emailEnabled) return;
    let cancelled = false;
    fetch("/api/send")
      .then((response) => (response.ok ? response.json() : { configured: false }))
      .then((payload: { configured?: boolean }) => {
        if (!cancelled) setEmailAvailable(Boolean(payload.configured));
      })
      .catch(() => {
        if (!cancelled) setEmailAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- clearing the draft after an output, with undo ------------------- */
  const clearDraftAfterOutput = useCallback(
    (what: string) => {
      if (!env.resetDraftAfterOutput || !draft.enabled) return;
      const snapshot = stateRef.current;
      draft.clear(snapshot);
      show({
        tone: "info",
        duration: 10000,
        message: `Draft cleared after ${what}.`,
        action: {
          label: "Undo",
          onClick: () => {
            const restored = draft.takeUndo();
            if (restored) {
              replaceState(restored);
              draft.saveNow();
            }
          },
        },
      });
    },
    [draft, replaceState, show],
  );

  const print = usePrint(state.settings.layout.paper, () => clearDraftAfterOutput("printing"));

  /* ---- Ctrl/Cmd+P runs our print path, not the browser's --------------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        print();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [print]);

  const resetEverything = () => {
    if (!window.confirm("Clear the form and start over?")) return;
    const snapshot = stateRef.current;
    resetAll();
    draft.clear(snapshot);
    show({
      tone: "info",
      duration: 10000,
      message: "Form cleared.",
      action: {
        label: "Undo",
        onClick: () => {
          const restored = draft.takeUndo();
          if (restored) replaceState(restored);
        },
      },
    });
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        draftEnabled={draft.enabled}
        onDraftToggle={draft.setEnabled}
        onReset={resetEverything}
        onSample={() => {
          replaceState(sampleState());
          show({ tone: "info", message: "Loaded example content — edit anything." });
        }}
        actions={
          <ActionBar
            state={state}
            coverRef={coverRef}
            onPrint={print}
            onEmail={() => setEmailOpen(true)}
            emailAvailable={emailAvailable}
          />
        }
      />

      {/* Mobile view switch */}
      <div className="shrink-0 border-b border-[var(--ui-line)] bg-white px-4 py-2 lg:hidden print:hidden">
        <Segmented<MobileView>
          value={mobileView}
          onValueChange={setMobileView}
          options={[
            { value: "edit", label: "Edit" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>

      <main className="flex min-h-0 flex-1 lg:overflow-hidden">
        {/* ---------------- Form column ---------------- */}
        <div
          className={`${
            mobileView === "edit" ? "flex" : "hidden"
          } min-h-0 w-full flex-col lg:flex lg:w-[42%] lg:max-w-[560px] lg:border-r lg:border-[var(--ui-line)] print:hidden`}
        >
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-28 lg:pb-6">
            <div className="flex flex-col gap-3">
              <MobilePeek state={state} onOpenFull={() => setMobileView("preview")} />

              <InstitutionSection />
              <DocumentSection />
              <StudentSection />
              <TeacherSection />
              <DatesSection />

              <div className="mt-2 flex items-center gap-3">
                <hr className="flex-1 border-[var(--ui-line)]" />
                <span className="text-xs font-medium tracking-wide text-[var(--ui-muted)] uppercase">
                  Customise
                </span>
                <hr className="flex-1 border-[var(--ui-line)]" />
              </div>

              <AdvancedPanel />

              <p className="px-1 py-4 text-center text-xs text-[var(--ui-muted)]">
                Everything here stays in your browser. No account, no tracking, no upload —
                except the email you choose to send.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- Preview column ---------------- */}
        <div
          className={`${
            mobileView === "preview" ? "flex" : "hidden"
          } print-show min-h-0 w-full flex-col bg-[var(--ui-bg)] lg:flex lg:flex-1`}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-2 print:hidden">
            <DraftChip enabled={draft.enabled} savedAt={draft.savedAt} />
            <span className="hidden text-xs text-[var(--ui-muted)] lg:block">
              Live preview · exactly what prints
            </span>
          </div>

          <PreviewFrame state={state} printRef={coverRef} />
        </div>
      </main>

      {/* ---------------- Mobile docked actions ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--ui-line)] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileView(mobileView === "edit" ? "preview" : "edit")}
            className={`${BUTTON_GHOST} shrink-0 border border-[var(--ui-line)]`}
          >
            {mobileView === "edit" ? (
              <>
                <PanelRightOpen className="size-4" />
                Preview
              </>
            ) : (
              <>
                <PencilLine className="size-4" />
                Edit
              </>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <ActionBar
              state={state}
              coverRef={coverRef}
              onPrint={print}
              onEmail={() => setEmailOpen(true)}
              emailAvailable={emailAvailable}
              compact
            />
          </div>
        </div>
      </div>

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        state={state}
        coverRef={coverRef}
        onSent={() => clearDraftAfterOutput("sending")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Header({
  draftEnabled,
  onDraftToggle,
  onReset,
  onSample,
  actions,
}: {
  draftEnabled: boolean;
  onDraftToggle: (enabled: boolean) => void;
  onReset: () => void;
  onSample: () => void;
  actions: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--ui-line)] bg-white px-4 py-3 print:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gray-900 text-white">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">Assignment Cover</h1>
          <p className="hidden text-xs text-[var(--ui-muted)] sm:block">
            Fill in, preview, print or email
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button type="button" onClick={onSample} className={`${BUTTON_GHOST} hidden sm:inline-flex`}>
          <Sparkles className="size-4" />
          Example
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={draftEnabled}
          onClick={() => onDraftToggle(!draftEnabled)}
          title={
            draftEnabled
              ? "Draft is saved in this browser. Click to turn off and erase it."
              : "Drafts are off. Click to save your work in this browser."
          }
          className={`${BUTTON_GHOST} ${draftEnabled ? "text-[var(--ui-text)]" : ""}`}
        >
          <Save className={`size-4 ${draftEnabled ? "" : "opacity-50"}`} />
          <span className="hidden sm:inline">{draftEnabled ? "Draft on" : "Draft off"}</span>
        </button>

        <button type="button" onClick={onReset} className={BUTTON_GHOST}>
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="hidden w-full lg:block lg:w-auto">{actions}</div>
    </header>
  );
}

/**
 * A phone-sized peek at the cover, pinned to the top of the form so a change
 * can be checked without losing your place. It is a second, non-printable
 * instance — `#print-root` stays unique to the real preview column.
 */
function MobilePeek({
  state,
  onOpenFull,
}: {
  state: CoverState;
  onOpenFull: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-1 border-b border-[var(--ui-line)] bg-[var(--ui-bg)]/95 px-4 py-2 backdrop-blur lg:hidden print:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`${BUTTON_GHOST} flex-1 justify-start px-2 py-1.5 text-xs`}
        >
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {open ? "Hide peek" : "Peek at the cover"}
        </button>

        <button
          type="button"
          onClick={onOpenFull}
          className={`${BUTTON_GHOST} px-2 py-1.5 text-xs`}
        >
          <Maximize2 className="size-3.5" />
          Full preview
        </button>
      </div>

      {open && (
        <div className="mt-2 flex h-[38vh] flex-col overflow-hidden rounded-lg border border-[var(--ui-line)] bg-white">
          <PreviewFrame
            state={state}
            printable={false}
            fitTo="contain"
            compact
            showControls={false}
            hint={false}
          />
        </div>
      )}
    </div>
  );
}

function DraftChip({ enabled, savedAt }: { enabled: boolean; savedAt: number | null }) {
  if (!enabled) {
    return (
      <span className="text-xs text-[var(--ui-muted)]">
        Draft off — nothing is stored on this device
      </span>
    );
  }

  if (!savedAt) {
    return <span className="text-xs text-[var(--ui-muted)]">Draft saves as you type</span>;
  }

  const time = new Date(savedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
      <Save className="size-3" aria-hidden />
      Draft saved · {time}
    </span>
  );
}
