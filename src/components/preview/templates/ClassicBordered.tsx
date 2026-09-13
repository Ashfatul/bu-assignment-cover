import type { ReactNode } from "react";

import { Footer, GroupMembers, Logo, SignatureLine } from "@/components/preview/parts";
import { SECTION_TITLES, type CoverModel, type Row } from "@/lib/cover-model";
import { fontSize, gap, readableOn, tint } from "@/lib/cover-style";
import type { CoverSettings, SectionId } from "@/lib/schema";

/**
 * Classic Bordered — a cleaned-up version of the familiar boxed cover. Keeps the
 * ruled table structure departments expect, but with consistent line weights,
 * proper cell padding, and tinted section bands instead of plain black rules.
 */
export function ClassicBordered({
  model,
  settings,
}: {
  model: CoverModel;
  settings: CoverSettings;
}) {
  const sections: Record<SectionId, ReactNode> = {
    heading: <HeadingBlock key="heading" model={model} settings={settings} />,
    course: <CourseBlock key="course" model={model} settings={settings} />,
    submittedBy: <SubmittedByBlock key="submittedBy" model={model} settings={settings} />,
    submittedTo: <SubmittedToBlock key="submittedTo" model={model} settings={settings} />,
    date: <DateBlock key="date" model={model} settings={settings} />,
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Masthead model={model} settings={settings} />
      <div style={{ display: "flex", flexDirection: "column", gap: gap(6), flex: 1 }}>
        {settings.layout.sectionOrder.map((id) => sections[id])}
      </div>
      {settings.extras.signatureLine && <SignatureLine />}
      <Footer text={model.footer} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const line = (settings: CoverSettings) =>
  settings.theme.borderStyle === "none"
    ? "0.15mm solid #d1d5db"
    : `var(--border-w) solid ${tint(settings.theme.accent, 0.62)}`;

function Masthead({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  return (
    <div style={{ textAlign: "center", marginBottom: gap(7) }}>
      <Logo src={model.logo} position={settings.layout.logoPosition} />
      {model.university && (
        <div
          style={{
            marginTop: model.logo ? gap(3) : 0,
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(1.7),
            fontWeight: 700,
            lineHeight: 1.15,
            color: "var(--accent)",
            letterSpacing: "0.01em",
          }}
        >
          {model.university}
        </div>
      )}
      {model.department && (
        <div
          style={{
            marginTop: "1.4mm",
            fontSize: fontSize(1),
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {model.department}
        </div>
      )}
      {model.tagline && (
        <div style={{ marginTop: "1mm", fontSize: fontSize(0.85), color: "var(--muted)" }}>
          {model.tagline}
        </div>
      )}
    </div>
  );
}

function HeadingBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const heading = settings.extras.uppercaseHeading ? model.heading.toUpperCase() : model.heading;
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: fontSize(2.2),
          fontWeight: 700,
          letterSpacing: "0.03em",
          lineHeight: 1.15,
        }}
      >
        {heading}
      </div>
      <div
        aria-hidden
        style={{
          width: "34mm",
          height: "0.6mm",
          background: "var(--accent)",
          margin: `${gap(2.5)} auto 0`,
        }}
      />
      {model.topic && (
        <div
          style={{
            marginTop: gap(3.5),
            fontSize: fontSize(1.2),
            lineHeight: 1.45,
            padding: "0 6mm",
          }}
        >
          {model.topic}
        </div>
      )}
    </div>
  );
}

/** A ruled table with a filled caption band, e.g. "Submitted By". */
function Table({
  caption,
  rows,
  settings,
  children,
}: {
  caption: string;
  rows: Row[];
  settings: CoverSettings;
  children?: ReactNode;
}) {
  const border = line(settings);
  const onAccent = readableOn(settings.theme.accent);

  return (
    <div style={{ border, borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div
        style={{
          background: "var(--accent)",
          color: onAccent,
          textAlign: "center",
          padding: `${gap(2)} 4mm`,
          fontFamily: "var(--font-heading)",
          fontSize: fontSize(1.25),
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {caption}
      </div>

      {rows.map((row, index) => (
        <div
          key={row.key}
          style={{
            display: "flex",
            borderTop: index === 0 ? undefined : border,
            background:
              settings.extras.watermark !== "off"
                ? "transparent"
                : index % 2 === 1
                  ? tint(settings.theme.accent, 0.97)
                  : "#ffffff",
          }}
        >
          <div
            style={{
              width: "42mm",
              flexShrink: 0,
              padding: `${gap(2)} 4mm`,
              fontWeight: 600,
              borderRight: border,
            }}
          >
            {row.label}
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: `${gap(2)} 4mm` }}>{row.value}</div>
        </div>
      ))}

      {children && <div style={{ borderTop: rows.length ? border : undefined }}>{children}</div>}
    </div>
  );
}

function CourseBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.courseRows.length) return null;
  return <Table caption={SECTION_TITLES.course} rows={model.courseRows} settings={settings} />;
}

function SubmittedByBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.studentRows.length && !model.groupMembers.length) return null;

  return (
    <Table caption={SECTION_TITLES.submittedBy} rows={model.studentRows} settings={settings}>
      {model.groupMembers.length > 0 && (
        <div style={{ padding: `${gap(2.5)} 4mm` }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: gap(1.5),
              fontSize: fontSize(0.9),
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Group Members
          </div>
          <GroupMembers members={model.groupMembers} />
        </div>
      )}
    </Table>
  );
}

function SubmittedToBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.teacherName && !model.teacherRows.length) return null;
  const border = line(settings);
  const onAccent = readableOn(settings.theme.accent);

  return (
    <div style={{ border, borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div
        style={{
          background: "var(--accent)",
          color: onAccent,
          textAlign: "center",
          padding: `${gap(2)} 4mm`,
          fontFamily: "var(--font-heading)",
          fontSize: fontSize(1.25),
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {SECTION_TITLES.submittedTo}
      </div>
      <div style={{ textAlign: "center", padding: `${gap(4)} 4mm` }}>
        {model.teacherName && (
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: fontSize(1.4),
              fontWeight: 700,
              marginBottom: model.teacherRows.length ? gap(1.5) : undefined,
            }}
          >
            {model.teacherName}
          </div>
        )}
        {model.teacherRows.map((row) => (
          <div key={row.key} style={{ lineHeight: 1.5 }}>
            {row.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.dateRows.length) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12mm",
        flexWrap: "wrap",
        marginTop: gap(1),
      }}
    >
      {model.dateRows.map((row) => (
        <div key={row.key} style={{ display: "flex", alignItems: "baseline", gap: "2mm" }}>
          <span style={{ fontWeight: 600 }}>{row.label}</span>
          {settings.extras.showColons && <span style={{ fontWeight: 600 }}>:</span>}
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
