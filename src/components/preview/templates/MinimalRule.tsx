import type { ReactNode } from "react";

import {
  DefinitionRows,
  Footer,
  GroupMembers,
  Logo,
  SectionLabel,
  SignatureLine,
} from "@/components/preview/parts";
import { SECTION_TITLES, type CoverModel } from "@/lib/cover-model";
import { fontSize, gap } from "@/lib/cover-style";
import type { CoverSettings, SectionId } from "@/lib/schema";

/**
 * Minimal Rule — typographic and quiet. No boxes or fills, only hairline rules.
 * The topic is the hero of the page. For students who want the cover to look
 * deliberately designed rather than institutional.
 */
export function MinimalRule({
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
    submittedTo: <SubmittedToBlock key="submittedTo" model={model} />,
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
      <div style={{ display: "flex", flexDirection: "column", gap: gap(8), flex: 1 }}>
        {settings.layout.sectionOrder.map((id) => sections[id])}
      </div>
      {settings.extras.signatureLine && <SignatureLine />}
      <Footer text={model.footer} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const HAIRLINE = "0.2mm solid #d4d4d8";

function Masthead({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const centered = settings.layout.logoPosition === "center";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: centered ? "center" : "space-between",
        flexDirection: settings.layout.logoPosition === "right" ? "row-reverse" : "row",
        gap: "5mm",
        paddingBottom: gap(3),
        borderBottom: HAIRLINE,
        marginBottom: gap(10),
        textAlign: centered ? "center" : undefined,
      }}
    >
      {centered ? (
        <div>
          <Logo src={model.logo} position="center" style={{ marginBottom: gap(2.5) }} />
          <Identity model={model} />
        </div>
      ) : (
        <>
          <Identity model={model} />
          <Logo src={model.logo} position="right" />
        </>
      )}
    </div>
  );
}

function Identity({ model }: { model: CoverModel }) {
  return (
    <div style={{ minWidth: 0 }}>
      {model.university && (
        <div
          style={{
            fontSize: fontSize(1.1),
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {model.university}
        </div>
      )}
      {model.department && (
        <div style={{ marginTop: "1mm", fontSize: fontSize(0.9), color: "var(--muted)" }}>
          {model.department}
        </div>
      )}
      {model.tagline && (
        <div style={{ marginTop: "0.8mm", fontSize: fontSize(0.82), color: "var(--muted)" }}>
          {model.tagline}
        </div>
      )}
    </div>
  );
}

function HeadingBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  const heading = settings.extras.uppercaseHeading ? model.heading.toUpperCase() : model.heading;

  return (
    <div>
      <div
        style={{
          fontSize: fontSize(0.85),
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        {heading}
      </div>
      {model.topic && (
        <div
          style={{
            marginTop: gap(3),
            fontFamily: "var(--font-heading)",
            fontSize: fontSize(2.35),
            fontWeight: 600,
            lineHeight: 1.22,
            letterSpacing: "-0.01em",
            maxWidth: "150mm",
          }}
        >
          {model.topic}
        </div>
      )}
      <div
        aria-hidden
        style={{ marginTop: gap(4), width: "22mm", height: "0.5mm", background: "var(--accent)" }}
      />
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <SectionLabel style={{ paddingBottom: gap(1.6), borderBottom: HAIRLINE }}>
        {title}
      </SectionLabel>
      <div style={{ marginTop: gap(2.5) }}>{children}</div>
    </div>
  );
}

function CourseBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.courseRows.length) return null;
  return (
    <Block title={SECTION_TITLES.course}>
      <DefinitionRows
        rows={model.courseRows}
        settings={settings}
        labelWidth="30mm"
        labelStyle={{ fontWeight: 500, color: "var(--muted)" }}
        valueStyle={{ fontWeight: 500 }}
      />
    </Block>
  );
}

function SubmittedByBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.studentRows.length && !model.groupMembers.length) return null;

  return (
    <Block title={SECTION_TITLES.submittedBy}>
      <DefinitionRows
        rows={model.studentRows}
        settings={settings}
        labelWidth="30mm"
        labelStyle={{ fontWeight: 500, color: "var(--muted)" }}
        valueStyle={{ fontWeight: 500 }}
      />
      {model.groupMembers.length > 0 && (
        <div style={{ marginTop: gap(3) }}>
          <div
            style={{
              fontSize: fontSize(0.8),
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: gap(1.5),
            }}
          >
            Group Members
          </div>
          <GroupMembers members={model.groupMembers} />
        </div>
      )}
    </Block>
  );
}

function SubmittedToBlock({ model }: { model: CoverModel }) {
  if (!model.teacherName && !model.teacherRows.length) return null;

  return (
    <Block title={SECTION_TITLES.submittedTo}>
      {model.teacherName && (
        <div style={{ fontSize: fontSize(1.25), fontWeight: 600 }}>{model.teacherName}</div>
      )}
      {model.teacherRows.length > 0 && (
        <div style={{ marginTop: gap(1.2), color: "var(--muted)", lineHeight: 1.5 }}>
          {model.teacherRows.map((row) => (
            <div key={row.key}>{row.value}</div>
          ))}
        </div>
      )}
    </Block>
  );
}

function DateBlock({ model, settings }: { model: CoverModel; settings: CoverSettings }) {
  if (!model.dateRows.length) return null;
  return (
    <Block title={SECTION_TITLES.date}>
      <DefinitionRows
        rows={model.dateRows}
        settings={settings}
        labelWidth="30mm"
        labelStyle={{ fontWeight: 500, color: "var(--muted)" }}
        valueStyle={{ fontWeight: 500 }}
      />
    </Block>
  );
}
