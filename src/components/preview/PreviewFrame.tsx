"use client";

import { Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { CoverPage } from "@/components/preview/CoverPage";
import { PAPER_SIZE_MM, type CoverState } from "@/lib/schema";

/** CSS millimetres per pixel at the standard 96dpi reference. */
const PX_PER_MM = 96 / 25.4;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

/** `useLayoutEffect` warns when React renders this on the server. */
const useFitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PreviewFrame({
  state,
  printRef,
  printable = true,
  fitTo = "width",
  compact = false,
  showControls = true,
  hint = true,
}: {
  state: CoverState;
  /** Attached to the page node so the print/PDF path can find it. */
  printRef?: React.Ref<HTMLDivElement>;
  /** Only the printable instance carries `#print-root`; ids must stay unique. */
  printable?: boolean;
  /** "width" fills the column; "contain" shrinks to fit a short box too. */
  fitTo?: "width" | "contain";
  compact?: boolean;
  showControls?: boolean;
  hint?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.5);
  /** null = follow the container; a number = user-chosen zoom. */
  const [manualZoom, setManualZoom] = useState<number | null>(null);

  const paper = PAPER_SIZE_MM[state.settings.layout.paper];
  const pageWidthPx = paper.width * PX_PER_MM;
  const pageHeightPx = paper.height * PX_PER_MM;

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Leave a little breathing room so the page shadow isn't clipped.
    const inset = compact ? 8 : 32;
    const availableWidth = el.clientWidth - inset;
    if (availableWidth <= 0) return;

    let next = availableWidth / pageWidthPx;
    if (fitTo === "contain") {
      const availableHeight = el.clientHeight - inset;
      if (availableHeight > 0) next = Math.min(next, availableHeight / pageHeightPx);
    }

    setFitScale(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next)));
  }, [compact, fitTo, pageWidthPx, pageHeightPx]);

  useFitEffect(measure, [measure]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const scale = manualZoom ?? fitScale;
  const step = (delta: number) =>
    setManualZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(0.25, Number(((current ?? fitScale) + delta).toFixed(2)))),
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className={`scroll-thin min-h-0 flex-1 overflow-auto ${compact ? "p-1" : "p-4"}`}
      >
        {/* Reserves the scaled footprint so scrollbars track the visible size. */}
        <div
          className="mx-auto"
          style={{ width: pageWidthPx * scale, height: pageHeightPx * scale }}
        >
          <div
            id={printable ? "print-root" : undefined}
            style={{
              width: pageWidthPx,
              height: pageHeightPx,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-8px_rgba(16,24,40,0.18)] ring-1 ring-black/5"
          >
            <CoverPage ref={printRef} state={state} hint={hint} />
          </div>
        </div>
      </div>

      {showControls && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--ui-line)] px-3 py-2 text-xs text-[var(--ui-muted)] print:hidden">
          <span className="tabular-nums">
            {state.settings.layout.paper} · {paper.width}×{paper.height} mm
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => step(-0.1)}
              disabled={scale <= 0.25}
              className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Zoom out"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-11 text-center tabular-nums">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => step(0.1)}
              disabled={scale >= MAX_ZOOM}
              className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Zoom in"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setManualZoom(null)}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-gray-100"
              aria-label="Fit to width"
              title="Fit to width"
            >
              <Scan className="size-4" />
              Fit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
