import { defaultState } from "@/config/defaults";
import {
  BORDER_STYLES,
  DATE_FORMATS,
  DENSITIES,
  FIELD_KEYS,
  FONT_PAIRS,
  LOGO_POSITIONS,
  MARGINS,
  PAPERS,
  SCALES,
  SECTIONS,
  TEMPLATES,
  WATERMARK_MODES,
  type CoverState,
  type FieldKey,
  type SectionId,
} from "@/lib/schema";

/**
 * Untrusted input (localStorage draft, imported JSON, URL hash) is merged onto
 * a fresh default state field by field. Anything missing, mistyped, or from an
 * older version is dropped rather than crashing a template downstream.
 */
type Unknown = Record<string, unknown>;

const isObject = (v: unknown): v is Unknown =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

const hex = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : fallback;

/** Only accept image sources we render ourselves: same-origin paths or data URLs. */
const logo = (v: unknown, fallback: string) => {
  if (typeof v !== "string") return fallback;
  const value = v.trim();
  if (value === "") return "";
  if (value.startsWith("/")) return value;
  if (/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/i.test(value)) {
    return value;
  }
  return fallback;
};

function sectionOrder(v: unknown, fallback: SectionId[]): SectionId[] {
  if (!Array.isArray(v)) return fallback;
  const seen = new Set<SectionId>();
  for (const entry of v) {
    if (typeof entry === "string" && (SECTIONS as readonly string[]).includes(entry)) {
      seen.add(entry as SectionId);
    }
  }
  // Append anything the input omitted so no section can disappear entirely.
  for (const section of SECTIONS) seen.add(section);
  return [...seen];
}

export function mergeState(input: unknown): CoverState {
  const base = defaultState();
  if (!isObject(input)) return base;

  const data = isObject(input.data) ? input.data : {};
  const settings = isObject(input.settings) ? input.settings : {};

  const institution = isObject(data.institution) ? data.institution : {};
  const document = isObject(data.document) ? data.document : {};
  const student = isObject(data.student) ? data.student : {};
  const group = isObject(data.group) ? data.group : {};
  const teacher = isObject(data.teacher) ? data.teacher : {};
  const dates = isObject(data.dates) ? data.dates : {};

  const theme = isObject(settings.theme) ? settings.theme : {};
  const layout = isObject(settings.layout) ? settings.layout : {};
  const extras = isObject(settings.extras) ? settings.extras : {};
  const fields = isObject(settings.fields) ? settings.fields : {};

  const members = Array.isArray(group.members)
    ? group.members
        .filter(isObject)
        .slice(0, 8)
        .map((m, index) => ({
          id: str(m.id, `m${index + 1}`),
          name: str(m.name, "").slice(0, 120),
          studentId: str(m.studentId, "").slice(0, 60),
        }))
    : base.data.group.members;

  const mergedFields = { ...base.settings.fields };
  for (const key of FIELD_KEYS) {
    const entry = fields[key];
    if (!isObject(entry)) continue;
    mergedFields[key as FieldKey] = {
      show: bool(entry.show, mergedFields[key].show),
      label: str(entry.label, mergedFields[key].label).slice(0, 40),
    };
  }

  return {
    data: {
      institution: {
        university: str(institution.university, base.data.institution.university),
        department: str(institution.department, base.data.institution.department),
        tagline: str(institution.tagline, base.data.institution.tagline),
        logo: logo(institution.logo, base.data.institution.logo),
      },
      document: {
        type: str(document.type, base.data.document.type),
        heading: str(document.heading, base.data.document.heading),
        courseTitle: str(document.courseTitle, base.data.document.courseTitle),
        courseCode: str(document.courseCode, base.data.document.courseCode),
        topic: str(document.topic, base.data.document.topic),
        assignmentNo: str(document.assignmentNo, base.data.document.assignmentNo),
      },
      student: {
        name: str(student.name, base.data.student.name),
        studentId: str(student.studentId, base.data.student.studentId),
        program: str(student.program, base.data.student.program),
        batch: str(student.batch, base.data.student.batch),
        semester: str(student.semester, base.data.student.semester),
        section: str(student.section, base.data.student.section),
        email: str(student.email, base.data.student.email),
        phone: str(student.phone, base.data.student.phone),
      },
      group: {
        enabled: bool(group.enabled, base.data.group.enabled),
        members,
      },
      teacher: {
        name: str(teacher.name, base.data.teacher.name),
        designation: str(teacher.designation, base.data.teacher.designation),
        department: str(teacher.department, base.data.teacher.department),
        institution: str(teacher.institution, base.data.teacher.institution),
        email: str(teacher.email, base.data.teacher.email),
      },
      dates: {
        submission: str(dates.submission, base.data.dates.submission),
        due: str(dates.due, base.data.dates.due),
      },
    },
    settings: {
      template: pick(settings.template, TEMPLATES, base.settings.template),
      theme: {
        accent: hex(theme.accent, base.settings.theme.accent),
        text: hex(theme.text, base.settings.theme.text),
        muted: hex(theme.muted, base.settings.theme.muted),
        fontPair: pick(theme.fontPair, FONT_PAIRS, base.settings.theme.fontPair),
        fontScale: pick(theme.fontScale, SCALES, base.settings.theme.fontScale),
        borderStyle: pick(theme.borderStyle, BORDER_STYLES, base.settings.theme.borderStyle),
        radius: num(theme.radius, base.settings.theme.radius, 0, 8),
      },
      layout: {
        paper: pick(layout.paper, PAPERS, base.settings.layout.paper),
        margin: pick(layout.margin, MARGINS, base.settings.layout.margin),
        marginMm:
          layout.marginMm === null || layout.marginMm === undefined
            ? base.settings.layout.marginMm
            : num(layout.marginMm, 20, 8, 40),
        logoSize: num(layout.logoSize, base.settings.layout.logoSize, 10, 70),
        logoPosition: pick(
          layout.logoPosition,
          LOGO_POSITIONS,
          base.settings.layout.logoPosition,
        ),
        density: pick(layout.density, DENSITIES, base.settings.layout.density),
        sectionOrder: sectionOrder(layout.sectionOrder, base.settings.layout.sectionOrder),
      },
      fields: mergedFields,
      extras: {
        watermark: pick(extras.watermark, WATERMARK_MODES, base.settings.extras.watermark),
        watermarkText: str(extras.watermarkText, base.settings.extras.watermarkText),
        watermarkOpacity: num(
          extras.watermarkOpacity,
          base.settings.extras.watermarkOpacity,
          0,
          0.3,
        ),
        watermarkScale: num(extras.watermarkScale, base.settings.extras.watermarkScale, 0.2, 1.5),
        footer: str(extras.footer, base.settings.extras.footer).slice(0, 200),
        signatureLine: bool(extras.signatureLine, base.settings.extras.signatureLine),
        showColons: bool(extras.showColons, base.settings.extras.showColons),
        uppercaseHeading: bool(extras.uppercaseHeading, base.settings.extras.uppercaseHeading),
        dateFormat: pick(extras.dateFormat, DATE_FORMATS, base.settings.extras.dateFormat),
      },
    },
  };
}
