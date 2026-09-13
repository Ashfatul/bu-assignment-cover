"use client";

import { useCallback, useEffect, useRef } from "react";

import { PAPER_SIZE_MM, type Paper } from "@/lib/schema";

const STYLE_ID = "acg-print-page-size";

/**
 * Drives `window.print()`.
 *
 * The `@page { size }` rule can't read a CSS custom property in any current
 * browser, so the concrete size is written into a dedicated <style> element
 * immediately before printing.
 *
 * `afterprint` fires whether the user printed or cancelled — browsers give us
 * no way to tell the difference — so anything destructive hung off `onAfter`
 * must be undoable.
 */
export function usePrint(paper: Paper, onAfter: () => void) {
  const afterRef = useRef(onAfter);
  afterRef.current = onAfter;

  useEffect(() => {
    const handle = () => afterRef.current();
    window.addEventListener("afterprint", handle);
    return () => window.removeEventListener("afterprint", handle);
  }, []);

  return useCallback(() => {
    const size = PAPER_SIZE_MM[paper];

    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    // An explicit mm pair rather than the `A4`/`letter` keyword: it is the most
    // widely honoured form, and it matches the page's own mm dimensions exactly.
    style.textContent = `@page { size: ${size.width}mm ${size.height}mm; margin: 0 }`;

    window.print();
  }, [paper]);
}
