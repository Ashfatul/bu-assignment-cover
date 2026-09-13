"use client";

import { Maximize2, Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { CoverPage } from "@/components/preview/CoverPage";
import { PAPER_SIZE_MM, type CoverState } from "@/lib/schema";

/** CSS millimetres per pixel at the standard 96dpi reference. */
const PX_PER_MM = 96 / 25.4;

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2.5;

/** `useLayoutEffect` warns when React renders this on the server. */
const useFitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PreviewFrame({
  state,
  printRef,
  printable = true,
  fitTo = "contain",
  compact = false,
  showControls = true,
  hint = true,
}: {
  state: CoverState;
  /** Attached to the page node so the print/PDF path can find it. */
  printRef?: React.Ref<HTMLDivElement>;
  /** Only the printable instance carries `#print-root`; ids must stay unique. */
  printable?: boolean;
  /** "contain" shrinks so full preview is visible at once; "width" fills the column. */
  fitTo?: "width" | "contain";
  compact?: boolean;
  showControls?: boolean;
  hint?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitMode, setFitMode] = useState<"contain" | "width">(fitTo);
  const [fitScale, setFitScale] = useState(0.5);
  /** null = follow the container fit; a number = user-chosen manual zoom. */
  const [manualZoom, setManualZoom] = useState<number | null>(null);

  const paper = PAPER_SIZE_MM[state.settings.layout.paper];
  const pageWidthPx = paper.width * PX_PER_MM;
  const pageHeightPx = paper.height * PX_PER_MM;

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Breathing room so the paper shadow isn't clipped
    const inset = compact ? 8 : 28;
    const availableWidth = el.clientWidth - inset;
    const availableHeight = el.clientHeight - inset;
    if (availableWidth <= 0) return;

    let next = availableWidth / pageWidthPx;
    if (fitMode === "contain" && availableHeight > 0) {
      next = Math.min(next, availableHeight / pageHeightPx);
    }

    setFitScale(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next)));
  }, [compact, fitMode, pageWidthPx, pageHeightPx]);

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
  const isFitPage = manualZoom === null && fitMode === "contain";
  const isFitWidth = manualZoom === null && fitMode === "width";
  const is100 = Math.round(scale * 100) === 100;

  const step = (delta: number) =>
    setManualZoom((current) => {
      const base = current ?? fitScale;
      const next = Math.round((base + delta) * 10) / 10;
      return Math.min(MAX_ZOOM, Math.max(0.2, Number(next.toFixed(2))));
    });

  const handlePageClick = () => {
    // If full page is currently fitted, clicking zooms in to fit width for reading
    if (isFitPage) {
      setFitMode("width");
      setManualZoom(null);
    }
  };

  const handlePageDoubleClick = () => {
    // Double clicking toggles between full page fit and width fit
    if (isFitPage) {
      setFitMode("width");
      setManualZoom(null);
    } else {
      setFitMode("contain");
      setManualZoom(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className={`scroll-thin min-h-0 flex-1 overflow-auto ${compact ? "p-1" : "p-3 sm:p-4"}`}
      >
        {/* Centers the page neatly within the preview pane */}
        <div className="flex min-h-full min-w-full items-center justify-center">
          <div
            className="transition-[width,height] duration-150 ease-out"
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
              onClick={handlePageClick}
              onDoubleClick={handlePageDoubleClick}
              title={
                isFitPage
                  ? "Click to zoom in (Fit Width)"
                  : "Double-click to fit full page"
              }
              className={`bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-8px_rgba(16,24,40,0.18)] ring-1 ring-black/5 transition-transform duration-150 ease-out select-none ${
                isFitPage ? "cursor-zoom-in" : "cursor-default"
              }`}
            >
              <CoverPage ref={printRef} state={state} hint={hint} />
            </div>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--ui-line)] bg-white px-3 py-2 text-xs text-[var(--ui-muted)] print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">{state.settings.layout.paper}</span>
            <span className="tabular-nums text-gray-400">
              · {paper.width}×{paper.height} mm
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => step(-0.1)}
              disabled={scale <= 0.25}
              className="cursor-pointer rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Zoom out"
              title="Zoom out (-10%)"
            >
              <Minus className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setManualZoom(1.0)}
              className="w-12 cursor-pointer text-center font-medium tabular-nums text-gray-700 hover:text-blue-600"
              title="Click to zoom to 100%"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={() => step(0.1)}
              disabled={scale >= MAX_ZOOM}
              className="cursor-pointer rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Zoom in"
              title="Zoom in (+10%)"
            >
              <Plus className="size-4" />
            </button>

            <div className="mx-1 h-3.5 w-px bg-gray-200" />

            {/* Fit Full Page Button */}
            <button
              type="button"
              onClick={() => {
                setFitMode("contain");
                setManualZoom(null);
              }}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isFitPage
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-label="Fit full page"
              title="Full preview: see entire page at once"
            >
              <Scan className="size-3.5" />
              <span>Fit Page</span>
            </button>

            {/* Fit Width Button */}
            <button
              type="button"
              onClick={() => {
                setFitMode("width");
                setManualZoom(null);
              }}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isFitWidth
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-label="Fit to width"
              title="Fit page to width"
            >
              <Maximize2 className="size-3.5" />
              <span>Fit Width</span>
            </button>

            {/* 100% Button */}
            <button
              type="button"
              onClick={() => setManualZoom(1.0)}
              className={`inline-flex cursor-pointer items-center rounded-md px-1.5 py-1 text-xs font-medium transition-colors ${
                is100 && manualZoom !== null
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-label="100% actual size"
              title="Actual size (100%)"
            >
              100%
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
