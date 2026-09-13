import type { CSSProperties } from "react";

import { fontSize, gap } from "@/lib/cover-style";
import type { CoverModel, Row } from "@/lib/cover-model";
import type { CoverSettings, LogoPosition } from "@/lib/schema";

/* -------------------------------------------------------------------------- */
/* Logo                                                                       */
/* -------------------------------------------------------------------------- */

const ALIGN: Record<LogoPosition, CSSProperties["justifyContent"]> = {
  center: "center",
  left: "flex-start",
  right: "flex-end",
};

export function Logo({
  src,
  position,
  style,
}: {
  src: string;
  position: LogoPosition;
  style?: CSSProperties;
}) {
  if (!src) return null;
  return (
    <div style={{ display: "flex", justifyContent: ALIGN[position], ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URLs, and next/image would rasterize for print */}
      <img
        src={src}
        alt=""
        style={{
          width: "var(--logo-size)",
          height: "var(--logo-size)",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Label/value rows                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Colon-separated rows, as on the reference cover. The label column is fixed so
 * every colon lines up regardless of label length.
 */
export function DefinitionRows({
  rows,
  settings,
  labelWidth = "32mm",
  labelStyle,
  valueStyle,
  rowGapMm = 1.6,
}: {
  rows: Row[];
  settings: CoverSettings;
  labelWidth?: string;
  labelStyle?: CSSProperties;
  valueStyle?: CSSProperties;
  rowGapMm?: number;
}) {
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gap(rowGapMm) }}>
      {rows.map((row) => (
        <div key={row.key} style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ width: labelWidth, flexShrink: 0, fontWeight: 600, ...labelStyle }}>
            {row.label}
          </span>
          {settings.extras.showColons && (
            <span style={{ width: "5mm", flexShrink: 0, fontWeight: 600, ...labelStyle }}>:</span>
          )}
          <span style={{ flex: 1, minWidth: 0, ...valueStyle }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Section heading used by the Modern Card and Minimal Rule templates. */
export function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: fontSize(0.78),
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--accent)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Group members                                                              */
/* -------------------------------------------------------------------------- */

export function GroupMembers({
  members,
  style,
}: {
  members: CoverModel["groupMembers"];
  style?: CSSProperties;
}) {
  if (!members.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gap(1.2), ...style }}>
      {members.map((member, index) => (
        <div key={index} style={{ display: "flex", alignItems: "baseline", gap: "3mm" }}>
          <span style={{ color: "var(--muted)", width: "6mm", flexShrink: 0 }}>
            {index + 1}.
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>{member.name}</span>
          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)" }}>
            {member.studentId}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer & signature                                                         */
/* -------------------------------------------------------------------------- */

export function SignatureLine({ label = "Signature" }: { label?: string }) {
  return (
    <div style={{ marginTop: gap(10), width: "58mm" }}>
      <div style={{ borderTop: "0.3mm solid var(--ink)", marginBottom: "1.5mm" }} />
      <div style={{ fontSize: fontSize(0.8), color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

export function Footer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: gap(4),
        fontSize: fontSize(0.78),
        color: "var(--muted)",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

/** Shown in the preview only, when the form is still untouched. */
export function EmptyHint() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20mm",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: fontSize(1.05),
        lineHeight: 1.6,
        zIndex: 3,
      }}
      className="print:hidden"
    >
      Start filling the form and your cover appears here.
    </div>
  );
}
