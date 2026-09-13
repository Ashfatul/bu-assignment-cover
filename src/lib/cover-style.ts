import type { CSSProperties } from "react";

import {
  BORDER_WIDTH_MM,
  DENSITY_FACTOR,
  MARGIN_MM,
  PAPER_SIZE_MM,
  SCALE_FACTOR,
  type CoverSettings,
} from "@/lib/schema";

export type CoverGeometry = {
  widthMm: number;
  heightMm: number;
  marginMm: number;
  /** Multiplier on every vertical gap, from the density setting. */
  density: number;
  /** Base font size in mm; templates scale their type off this. */
  baseMm: number;
  borderMm: number;
  radiusMm: number;
};

export function geometry(settings: CoverSettings): CoverGeometry {
  const paper = PAPER_SIZE_MM[settings.layout.paper];
  const marginMm = settings.layout.marginMm ?? MARGIN_MM[settings.layout.margin];

  return {
    widthMm: paper.width,
    heightMm: paper.height,
    marginMm,
    density: DENSITY_FACTOR[settings.layout.density],
    // 3.4mm ≈ 9.6pt, a sensible body size for a cover page.
    baseMm: 3.4 * SCALE_FACTOR[settings.theme.fontScale],
    borderMm: BORDER_WIDTH_MM[settings.theme.borderStyle],
    radiusMm: settings.theme.radius,
  };
}

/** Font stacks for the document body and for headings, per font pair. */
export function fontStacks(pair: CoverSettings["theme"]["fontPair"]) {
  const sans = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
  const serif = "var(--font-lora), ui-serif, Georgia, serif";
  switch (pair) {
    case "serif":
      return { body: serif, heading: serif };
    case "sans":
      return { body: sans, heading: sans };
    case "mixed":
      return { body: sans, heading: serif };
  }
}

/**
 * CSS custom properties shared by every template. Templates consume these
 * instead of reading settings directly, which keeps their markup readable and
 * makes the mm-based sizing consistent across all three.
 */
export function coverCssVars(settings: CoverSettings): CSSProperties {
  const geo = geometry(settings);
  const fonts = fontStacks(settings.theme.fontPair);

  return {
    width: `${geo.widthMm}mm`,
    height: `${geo.heightMm}mm`,
    padding: `${geo.marginMm}mm`,
    color: settings.theme.text,
    fontFamily: fonts.body,
    ["--page-w" as string]: `${geo.widthMm}mm`,
    ["--page-h" as string]: `${geo.heightMm}mm`,
    ["--page-margin" as string]: `${geo.marginMm}mm`,
    ["--page-base" as string]: `${geo.baseMm}mm`,
    ["--accent" as string]: settings.theme.accent,
    ["--ink" as string]: settings.theme.text,
    ["--muted" as string]: settings.theme.muted,
    ["--border-w" as string]: `${geo.borderMm}mm`,
    ["--radius" as string]: `${geo.radiusMm}mm`,
    ["--density" as string]: String(geo.density),
    ["--font-body" as string]: fonts.body,
    ["--font-heading" as string]: fonts.heading,
    ["--logo-size" as string]: `${settings.layout.logoSize}mm`,
  };
}

/** `calc()` helper: a vertical gap in mm, scaled by the density setting. */
export function gap(mm: number): string {
  return `calc(${mm}mm * var(--density))`;
}

/** A type size expressed as a multiple of the base size. */
export function fontSize(multiplier: number): string {
  return `calc(var(--page-base) * ${multiplier})`;
}

/** Mixes a hex colour toward white; used for tinted bands and rails. */
export function tint(hex: string, amount: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`;
}

/** Perceived luminance, for picking readable text over a filled accent band. */
export function readableOn(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return "#ffffff";
  const value = parseInt(match[1], 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.45 ? "#111827" : "#ffffff";
}
