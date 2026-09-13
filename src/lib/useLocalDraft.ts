"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { env } from "@/config/defaults";
import { mergeState } from "@/lib/merge";
import type { CoverState } from "@/lib/schema";

const DRAFT_KEY = "acg:draft:v1";
const TOGGLE_KEY = "acg:draft-enabled:v1";
const DEBOUNCE_MS = 600;

type DraftRecord = { savedAt: number; state: CoverState };

/** Reads any persisted draft. Runs once, before the first paint of the editor. */
export function readDraft(): DraftRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as { savedAt?: unknown; state?: unknown };
    return {
      savedAt: typeof record.savedAt === "number" ? record.savedAt : 0,
      state: mergeState(record.state),
    };
  } catch {
    // Corrupt or unreadable (private mode, quota) — start clean.
    return null;
  }
}

export function readDraftEnabled(): boolean {
  if (typeof window === "undefined") return env.draftEnabled;
  const raw = window.localStorage.getItem(TOGGLE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return env.draftEnabled;
}

/**
 * Persists the editor state to localStorage, debounced. Returns the toggle and
 * the last-saved timestamp so the UI can show a "saved" chip — which is hidden
 * when printing, since it isn't part of the document.
 */
export function useLocalDraft(state: CoverState) {
  // Starts from the env default so the first client render matches the server's;
  // the stored preference is read after mount, below.
  const [enabled, setEnabled] = useState<boolean>(env.draftEnabled);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  /** Snapshot kept in memory so a reset can be undone. */
  const undoRef = useRef<CoverState | null>(null);
  const skipFirstWrite = useRef(true);

  useEffect(() => {
    setEnabled(readDraftEnabled());
  }, []);

  const write = useCallback((next: CoverState) => {
    try {
      const record: DraftRecord = { savedAt: Date.now(), state: next };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(record));
      setSavedAt(record.savedAt);
    } catch {
      // Most likely a quota error from a large logo data URL. The app keeps
      // working from memory; the draft simply isn't persisted.
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Don't immediately re-write the draft we just restored.
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const timer = window.setTimeout(() => write(state), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [state, enabled, write]);

  const setEnabledPersisted = useCallback((next: boolean) => {
    setEnabled(next);
    try {
      window.localStorage.setItem(TOGGLE_KEY, String(next));
      if (!next) {
        window.localStorage.removeItem(DRAFT_KEY);
        setSavedAt(null);
      }
    } catch {
      /* ignore storage failures */
    }
  }, []);

  /** Clears the stored draft, keeping one in-memory snapshot for Undo. */
  const clear = useCallback((snapshot?: CoverState) => {
    undoRef.current = snapshot ?? null;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setSavedAt(null);
  }, []);

  const takeUndo = useCallback(() => {
    const snapshot = undoRef.current;
    undoRef.current = null;
    return snapshot;
  }, []);

  return {
    enabled,
    setEnabled: setEnabledPersisted,
    savedAt,
    clear,
    takeUndo,
    saveNow: () => write(state),
  };
}
