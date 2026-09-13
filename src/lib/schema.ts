/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const TEMPLATES = ["modern-card", "classic-bordered", "minimal-rule"] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  "modern-card": "Modern Card",
  "classic-bordered": "Classic Bordered",
  "minimal-rule": "Minimal Rule",
};

export const FONT_PAIRS = ["serif", "sans", "mixed"] as const;
export type FontPair = (typeof FONT_PAIRS)[number];

export const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "D MMMM YYYY", "YYYY-MM-DD"] as const;
export type DateFormat = (typeof DATE_FORMATS)[number];

export const PAPERS = ["A4", "Letter"] as const;
export type Paper = (typeof PAPERS)[number];

export const WATERMARK_MODES = ["off", "logo", "text"] as const;
export type WatermarkMode = (typeof WATERMARK_MODES)[number];

export const LOGO_POSITIONS = ["center", "left", "right"] as const;
export type LogoPosition = (typeof LOGO_POSITIONS)[number];

export const DENSITIES = ["compact", "normal", "airy"] as const;
export type Density = (typeof DENSITIES)[number];

export const SCALES = ["s", "m", "l"] as const;
export type Scale = (typeof SCALES)[number];

export const BORDER_STYLES = ["none", "hairline", "solid"] as const;
export type BorderStyle = (typeof BORDER_STYLES)[number];

export const MARGINS = ["narrow", "normal", "wide"] as const;
export type MarginPreset = (typeof MARGINS)[number];

export const SECTIONS = ["heading", "course", "submittedBy", "submittedTo", "date"] as const;
export type SectionId = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  heading: "Heading",
  course: "Course details",
  submittedBy: "Submitted By",
  submittedTo: "Submitted To",
  date: "Date",
};

export const DOCUMENT_TYPES = [
  "Assignment",
  "Lab Report",
  "Project Report",
  "Presentation",
  "Term Paper",
] as const;

/* -------------------------------------------------------------------------- */
/* Field registry — drives show/hide + relabel in the Advanced panel          */
/* -------------------------------------------------------------------------- */

export const FIELD_KEYS = [
  "courseTitle",
  "courseCode",
  "topic",
  "assignmentNo",
  "studentName",
  "studentId",
  "program",
  "batch",
  "semester",
  "section",
  "studentEmail",
  "studentPhone",
  "teacherName",
  "teacherDesignation",
  "teacherDepartment",
  "teacherInstitution",
  "teacherEmail",
  "submissionDate",
  "dueDate",
] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];

export const DEFAULT_FIELD_LABELS: Record<FieldKey, string> = {
  courseTitle: "Course Title",
  courseCode: "Course Code",
  topic: "Topic",
  assignmentNo: "Assignment No",
  studentName: "Name",
  studentId: "ID",
  program: "Program",
  batch: "Batch",
  semester: "Semester",
  section: "Section",
  studentEmail: "Email",
  studentPhone: "Phone",
  teacherName: "Name",
  teacherDesignation: "Designation",
  teacherDepartment: "Department",
  teacherInstitution: "Institution",
  teacherEmail: "Email",
  submissionDate: "Date of Submission",
  dueDate: "Due Date",
};

/** Fields that stay hidden until the user turns them on. */
export const OPTIONAL_FIELDS: FieldKey[] = [
  "assignmentNo",
  "studentEmail",
  "studentPhone",
  "teacherEmail",
  "dueDate",
];

export type FieldConfig = { show: boolean; label: string };

/* -------------------------------------------------------------------------- */
/* Cover data                                                                 */
/* -------------------------------------------------------------------------- */

export type GroupMember = { id: string; name: string; studentId: string };

export type CoverData = {
  institution: {
    university: string;
    department: string;
    tagline: string;
    /** URL or data URL. Empty string means "no logo". */
    logo: string;
  };
  document: {
    type: string;
    heading: string;
    courseTitle: string;
    courseCode: string;
    topic: string;
    assignmentNo: string;
  };
  student: {
    name: string;
    studentId: string;
    program: string;
    batch: string;
    semester: string;
    section: string;
    email: string;
    phone: string;
  };
  group: {
    enabled: boolean;
    members: GroupMember[];
  };
  teacher: {
    name: string;
    designation: string;
    department: string;
    institution: string;
    email: string;
  };
  dates: {
    /** ISO `YYYY-MM-DD`, or empty. */
    submission: string;
    due: string;
  };
};

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export type CoverSettings = {
  template: TemplateId;
  theme: {
    accent: string;
    text: string;
    muted: string;
    fontPair: FontPair;
    fontScale: Scale;
    borderStyle: BorderStyle;
    radius: number; // mm
  };
  layout: {
    paper: Paper;
    margin: MarginPreset;
    marginMm: number | null; // overrides the preset when set
    logoSize: number; // mm
    logoPosition: LogoPosition;
    density: Density;
    sectionOrder: SectionId[];
  };
  fields: Record<FieldKey, FieldConfig>;
  extras: {
    watermark: WatermarkMode;
    watermarkText: string;
    watermarkOpacity: number; // 0..1
    watermarkScale: number; // 0.2..1.5 of page width
    footer: string;
    signatureLine: boolean;
    showColons: boolean;
    uppercaseHeading: boolean;
    dateFormat: DateFormat;
  };
};

export type CoverState = {
  data: CoverData;
  settings: CoverSettings;
};

/* -------------------------------------------------------------------------- */
/* Derived geometry                                                           */
/* -------------------------------------------------------------------------- */

export const PAPER_SIZE_MM: Record<Paper, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

export const MARGIN_MM: Record<MarginPreset, number> = {
  narrow: 14,
  normal: 20,
  wide: 28,
};

export const DENSITY_FACTOR: Record<Density, number> = {
  compact: 0.8,
  normal: 1,
  airy: 1.25,
};

export const SCALE_FACTOR: Record<Scale, number> = {
  s: 0.92,
  m: 1,
  l: 1.1,
};

export const BORDER_WIDTH_MM: Record<BorderStyle, number> = {
  none: 0,
  hairline: 0.2,
  solid: 0.5,
};
