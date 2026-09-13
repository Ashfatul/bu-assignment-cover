import type { CSSProperties, ReactNode } from "react";

import {
  DefinitionRows,
  Footer,
  GroupMembers,
  Logo,
  SectionLabel,
  SignatureLine,
} from "@/components/preview/parts";
import { SECTION_TITLES, type CoverModel } from "@/lib/cover-model";
import { fontSize, gap, readableOn, tint } from "@/lib/cover-style";
import type { CoverSettings, SectionId } from "@/lib/schema";

/**
 * Modern Card — the default. An accent rail down the left edge, a filled title
 * band, and borderless two-column data blocks separated by whitespace rather
 * than a table grid. Formal enough for any department, but clearly designed.
 */
export function ModernCard({
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
    date: <DateBlock key="date" model={model} />,
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
      {/* Accent rail, bleeding to the sheet edge outside the page padding. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "calc(var(--page-margin) * -1)",
          bottom: "calc(var(--page-margin) * -1)",
          left: "calc(var(--page-margin) * -1)",
          width: "4mm",
          background: "var(--accent)",
        }}
      />

      <Masthead model={model} settings={settings} />

      <div style={{ display: "flex", flexDirection: "column", gap: gap(7), flex: 1 }}>
        {settings.layout.sectionOrder.map((id) => sections[id])}
      </div>

      {settings.extras.signatureLine && <SignatureLine />}
      <Footer text={model.footer} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Masthead({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const centered = settings.layout.logoPosition === "center";
  const right = settings.layout.logoPosition === "right";

  const identity = (
    <div style={{ textAlign: centered ? "center" : right ? "left" : "left", minWidth: 0 }}>
      {model.university && (
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(1.55),
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
          }}
        >
          {model.university}
        </div>
      )}
      {model.department && (
        <div
          style={{
            marginTop: "1.2mm",
            fontSize: fontSize(0.95),
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--muted)",
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

  return (
    <div style={{ marginBottom: gap(9) }}>
      {centered ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Logo src={model.logo} position="center" style={{ marginBottom: gap(3.5) }} />
          {identity}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6mm",
            flexDirection: right ? "row-reverse" : "row",
          }}
        >
          <Logo src={model.logo} position="left" />
          <div style={{ flex: 1, minWidth: 0 }}>{identity}</div>
        </div>
      )}

      <div
        aria-hidden
        style={{
          marginTop: gap(4),
          height: "0.4mm",
          background: "var(--accent)",
          opacity: 0.85,
        }}
      />
    </div>
  );
}

function HeadingBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const heading = settings.extras.uppercaseHeading ? model.heading.toUpperCase() : model.heading;
  const onAccent = readableOn(settings.theme.accent);

  return (
    <div>
      <div
        style={{
          background: "var(--accent)",
          color: onAccent,
          padding: `${gap(3)} 6mm`,
          borderRadius: "var(--radius)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(2.1),
            fontWeight: 700,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
          }}
        >
          {heading}
        </div>
      </div>

      {model.topic && (
        <div
          style={{
            marginTop: gap(4),
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(1.3),
            lineHeight: 1.4,
            textAlign: "center",
            padding: "0 4mm",
          }}
        >
          {model.topic}
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  children,
  settings,
  style,
}: {
  title?: string;
  children: ReactNode;
  settings: CoverSettings;
  style?: CSSProperties;
}) {
  const border = settings.theme.borderStyle === "none" ? undefined : "var(--border-w) solid";
  return (
    <div
      style={{
        background: tint(settings.theme.accent, 0.955),
        border: border ? `${border} ${tint(settings.theme.accent, 0.78)}` : undefined,
        borderRadius: "var(--radius)",
        padding: `${gap(4)} 6mm`,
        ...style,
      }}
    >
      {title && <SectionLabel style={{ marginBottom: gap(2.5) }}>{title}</SectionLabel>}
      {children}
    </div>
  );
}

function CourseBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.courseRows.length) return null;
  return (
    <Card settings={settings} title={SECTION_TITLES.course}>
      <DefinitionRows rows={model.courseRows} settings={settings} labelWidth="30mm" />
    </Card>
  );
}

function SubmittedByBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const hasContent = model.studentRows.length > 0 || model.groupMembers.length > 0;
  if (!hasContent) return null;

  return (
    <Card settings={settings} title={SECTION_TITLES.submittedBy}>
      <DefinitionRows rows={model.studentRows} settings={settings} labelWidth="30mm" />
      {model.groupMembers.length > 0 && (
        <>
          <div
            aria-hidden
            style={{
              margin: `${gap(3)} 0`,
              height: "var(--border-w)",
              minHeight: "0.15mm",
              background: tint(settings.theme.accent, 0.7),
            }}
          />
          <SectionLabel style={{ marginBottom: gap(2), color: "var(--muted)" }}>
            Group Members
          </SectionLabel>
          <GroupMembers members={model.groupMembers} />
        </>
      )}
    </Card>
  );
}

function SubmittedToBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.teacherName && !model.teacherRows.length) return null;

  return (
    <Card settings={settings} title={SECTION_TITLES.submittedTo}>
      {model.teacherName && (
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(1.3),
            fontWeight: 700,
            marginBottom: model.teacherRows.length ? gap(2) : undefined,
          }}
        >
          {model.teacherName}
        </div>
      )}
      {model.teacherRows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: gap(1.2) }}>
          {model.teacherRows.map((row) => (
            <div key={row.key} style={{ color: "var(--muted)" }}>
              {row.value}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DateBlock({ model }: { model: CoverModel }) {
  if (!model.dateRows.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10mm", flexWrap: "wrap" }}>
      {model.dateRows.map((row) => (
        <div key={row.key} style={{ textAlign: "center" }}>
          <SectionLabel style={{ color: "var(--muted)" }}>{row.label}</SectionLabel>
          <div style={{ marginTop: "1.2mm", fontSize: fontSize(1.1), fontWeight: 600 }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}
