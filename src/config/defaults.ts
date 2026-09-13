import {
  BORDER_STYLES,
  DATE_FORMATS,
  DEFAULT_FIELD_LABELS,
  DENSITIES,
  FIELD_KEYS,
  FONT_PAIRS,
  LOGO_POSITIONS,
  MARGINS,
  OPTIONAL_FIELDS,
  PAPERS,
  SCALES,
  SECTIONS,
  TEMPLATES,
  WATERMARK_MODES,
  type BorderStyle,
  type CoverSettings,
  type CoverState,
  type DateFormat,
  type Density,
  type FieldConfig,
  type FieldKey,
  type FontPair,
  type LogoPosition,
  type MarginPreset,
  type Paper,
  type Scale,
  type TemplateId,
  type WatermarkMode,
} from "@/lib/schema";

/**
 * Env is read through these helpers so a missing or misspelled value can never
 * break the app — it silently falls back to the shipped default.
 */
function str(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const trimmed = value?.trim() as T | undefined;
  return trimmed && allowed.includes(trimmed) ? trimmed : fallback;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed === "true" || trimmed === "1") return true;
  if (trimmed === "false" || trimmed === "0") return false;
  return fallback;
}

function hex(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
}

export const env = {
  university: str(process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY, "Bangladesh University"),
  department: str(process.env.NEXT_PUBLIC_DEFAULT_DEPARTMENT, "Department of CSE"),
  logoUrl: str(process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL, "/logos/bu-logo.png"),
  program: str(process.env.NEXT_PUBLIC_DEFAULT_PROGRAM, ""),
  batch: str(process.env.NEXT_PUBLIC_DEFAULT_BATCH, ""),
  semester: str(process.env.NEXT_PUBLIC_DEFAULT_SEMESTER, ""),
  section: str(process.env.NEXT_PUBLIC_DEFAULT_SECTION, ""),
  studentName: str(process.env.NEXT_PUBLIC_DEFAULT_STUDENT_NAME, ""),
  studentId: str(process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID, ""),

  template: oneOf<TemplateId>(
    process.env.NEXT_PUBLIC_DEFAULT_TEMPLATE,
    TEMPLATES,
    "modern-card",
  ),
  accent: hex(process.env.NEXT_PUBLIC_DEFAULT_ACCENT, "#B91C1C"),
  fontPair: oneOf<FontPair>(process.env.NEXT_PUBLIC_DEFAULT_FONT_PAIR, FONT_PAIRS, "mixed"),
  dateFormat: oneOf<DateFormat>(
    process.env.NEXT_PUBLIC_DEFAULT_DATE_FORMAT,
    DATE_FORMATS,
    "DD/MM/YYYY",
  ),
  paper: oneOf<Paper>(process.env.NEXT_PUBLIC_DEFAULT_PAPER, PAPERS, "A4"),
  watermark: oneOf<WatermarkMode>(
    process.env.NEXT_PUBLIC_DEFAULT_WATERMARK,
    WATERMARK_MODES,
    "logo",
  ),

  draftEnabled: bool(process.env.NEXT_PUBLIC_DRAFT_ENABLED_BY_DEFAULT, true),
  resetDraftAfterOutput: bool(process.env.NEXT_PUBLIC_RESET_DRAFT_AFTER_OUTPUT, true),
  emailEnabled: bool(process.env.NEXT_PUBLIC_FEATURE_EMAIL, true),

  // Advanced knobs, env-tunable but rarely touched.
  logoSize: Number(process.env.NEXT_PUBLIC_DEFAULT_LOGO_SIZE ?? "") || 34,
  margin: oneOf<MarginPreset>(process.env.NEXT_PUBLIC_DEFAULT_MARGIN, MARGINS, "normal"),
  density: oneOf<Density>(process.env.NEXT_PUBLIC_DEFAULT_DENSITY, DENSITIES, "normal"),
  fontScale: oneOf<Scale>(process.env.NEXT_PUBLIC_DEFAULT_FONT_SCALE, SCALES, "m"),
  borderStyle: oneOf<BorderStyle>(
    process.env.NEXT_PUBLIC_DEFAULT_BORDER_STYLE,
    BORDER_STYLES,
    "hairline",
  ),
  logoPosition: oneOf<LogoPosition>(
    process.env.NEXT_PUBLIC_DEFAULT_LOGO_POSITION,
    LOGO_POSITIONS,
    "center",
  ),
} as const;

function defaultFields(): Record<FieldKey, FieldConfig> {
  const entries = FIELD_KEYS.map(
    (key) =>
      [key, { show: !OPTIONAL_FIELDS.includes(key), label: DEFAULT_FIELD_LABELS[key] }] as const,
  );
  return Object.fromEntries(entries) as Record<FieldKey, FieldConfig>;
}

export function defaultSettings(): CoverSettings {
  return {
    template: env.template,
    theme: {
      accent: env.accent,
      text: "#111827",
      muted: "#6B7280",
      fontPair: env.fontPair,
      fontScale: env.fontScale,
      borderStyle: env.borderStyle,
      radius: 2,
    },
    layout: {
      paper: env.paper,
      margin: env.margin,
      marginMm: null,
      logoSize: env.logoSize,
      logoPosition: env.logoPosition,
      density: env.density,
      sectionOrder: [...SECTIONS],
    },
    fields: defaultFields(),
    extras: {
      watermark: env.watermark,
      watermarkText: env.university,
      watermarkOpacity: 0.07,
      watermarkScale: 0.62,
      footer: "",
      signatureLine: false,
      showColons: true,
      uppercaseHeading: true,
      dateFormat: env.dateFormat,
    },
  };
}

export function defaultState(): CoverState {
  return {
    data: {
      institution: {
        university: env.university,
        department: env.department,
        tagline: "",
        logo: env.logoUrl,
      },
      document: {
        type: "Assignment",
        heading: "Assignment On",
        courseTitle: "",
        courseCode: "",
        topic: "",
        assignmentNo: "",
      },
      student: {
        name: env.studentName,
        studentId: env.studentId,
        program: env.program,
        batch: env.batch,
        semester: env.semester,
        section: env.section,
        email: "",
        phone: "",
      },
      group: { enabled: false, members: [] },
      teacher: {
        name: "",
        designation: "",
        department: env.department,
        institution: env.university,
        email: "",
      },
      dates: { submission: "", due: "" },
    },
    settings: defaultSettings(),
  };
}

/** Fills the form with the reference cover's content, for a one-click demo. */
export function sampleState(): CoverState {
  const base = defaultState();
  return {
    ...base,
    data: {
      ...base.data,
      institution: {
        university: base.data.institution.university || "Bangladesh University",
        department: base.data.institution.department || "Department of CSE",
        tagline: "",
        logo: base.data.institution.logo,
      },
      document: {
        type: "Assignment",
        heading: "Assignment On",
        courseTitle: "Digital System Design Lab",
        courseCode: "CSE-3204",
        topic: "Combinational Logic Using Multiplexers, PLA, and PAL",
        assignmentNo: "",
      },
      student: {
        name: base.data.student.name || "A. A. M Ashfatul Islam",
        studentId: base.data.student.studentId || "202411068038",
        program: base.data.student.program || "B.Sc. in CSE",
        batch: base.data.student.batch || "68 - Evening",
        semester: base.data.student.semester || "Summer 2025",
        section: base.data.student.section || "B",
        email: "",
        phone: "",
      },
      teacher: {
        name: "Faria Afrin Niha",
        designation: "Lecturer",
        department: base.data.teacher.department || "Department of CSE",
        institution: base.data.teacher.institution || "Bangladesh University",
        email: "",
      },
      dates: { submission: "2026-05-15", due: "" },
    },
  };
}
