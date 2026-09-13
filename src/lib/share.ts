import { mergeState } from "@/lib/merge";
import type { CoverSettings, CoverState } from "@/lib/schema";

/**
 * Settings portability. Two flavours:
 *
 *  - JSON file: full state or settings-only, for backups.
 *  - URL hash:  settings only, so a class can share one house style. The hash
 *               never leaves the browser (servers don't receive it), and it
 *               deliberately excludes personal data.
 */

const HASH_PREFIX = "#s=";

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** A share link carrying only the look-and-feel settings. */
export function buildShareUrl(settings: CoverSettings): string {
  const encoded = toBase64(JSON.stringify({ settings }));
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${HASH_PREFIX}${encodeURIComponent(encoded)}`;
}

/** Reads settings out of the current URL hash, if present and valid. */
export function readSettingsFromHash(): CoverSettings | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const json = fromBase64(decodeURIComponent(hash.slice(HASH_PREFIX.length)));
    const parsed: unknown = JSON.parse(json);
    return mergeState(parsed).settings;
  } catch {
    return null;
  }
}

export function clearHash(): void {
  if (typeof window === "undefined" || !window.location.hash) return;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

export function exportStateJson(state: CoverState): Blob {
  const payload = { app: "assignment-cover", version: 1, ...state };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

/** Parses an imported JSON file; unknown or partial shapes are healed. */
export async function importStateJson(file: File): Promise<CoverState> {
  const text = await file.text();
  return mergeState(JSON.parse(text));
}
