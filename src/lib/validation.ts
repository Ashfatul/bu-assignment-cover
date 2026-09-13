import type { CoverData } from "@/lib/schema";

export type SectionKey = "institution" | "document" | "student" | "teacher" | "dates";

export type FieldMeta = {
  key: string;
  label: string;
  section: SectionKey;
  required: boolean;
};

/**
 * Fields present on the reference cover page (Bu Assignment Cover DSD 38.pdf)
 * that must be filled.
 */
export const PDF_REQUIRED_FIELDS: FieldMeta[] = [
  { key: "university", label: "University", section: "institution", required: true },
  { key: "department", label: "Department / Faculty", section: "institution", required: true },
  { key: "logo", label: "University logo", section: "institution", required: true },
  { key: "courseTitle", label: "Course title", section: "document", required: true },
  { key: "courseCode", label: "Course code", section: "document", required: true },
  { key: "topic", label: "Topic", section: "document", required: true },
  { key: "studentName", label: "Full name", section: "student", required: true },
  { key: "studentId", label: "Student ID", section: "student", required: true },
  { key: "program", label: "Program", section: "student", required: true },
  { key: "batch", label: "Batch", section: "student", required: true },
  { key: "semester", label: "Semester", section: "student", required: true },
  { key: "section", label: "Section / Group", section: "student", required: true },
  { key: "teacherName", label: "Teacher name", section: "teacher", required: true },
  { key: "teacherDesignation", label: "Teacher designation", section: "teacher", required: true },
  { key: "teacherDepartment", label: "Teacher department", section: "teacher", required: true },
  { key: "teacherInstitution", label: "Teacher institution", section: "teacher", required: true },
  { key: "submissionDate", label: "Date of submission", section: "dates", required: true },
];

/**
 * Default / sample values from the reference assignment PDF.
 * These are assignment-specific fields that are supposed to be changed
 * for each new assignment cover even if they carry a default value.
 */
export const SAMPLE_DEFAULT_VALUES: Record<
  string,
  { label: string; section: SectionKey; defaults: string[]; message: string }
> = {
  courseTitle: {
    label: "Course title",
    section: "document",
    defaults: ["digital system design lab"],
    message: "Still set to default course ('Digital System Design Lab') — update for your assignment.",
  },
  courseCode: {
    label: "Course code",
    section: "document",
    defaults: ["cse-3204"],
    message: "Still set to default code ('CSE-3204') — update for your assignment.",
  },
  topic: {
    label: "Topic",
    section: "document",
    defaults: [
      "combinational logic using multiplexers, pla, and pal",
      "assignment on combinational logic using multiplexers, pla, and pal",
    ],
    message: "Still set to default topic ('Combinational Logic Using Multiplexers...') — update for your assignment.",
  },
  submissionDate: {
    label: "Date of submission",
    section: "dates",
    defaults: ["2026-05-15", "15/05/2026"],
    message: "Still set to sample date (15/05/2026) — update or click 'Today'.",
  },
  teacherName: {
    label: "Teacher name",
    section: "teacher",
    defaults: ["faria afrin niha"],
    message: "Still set to default instructor ('Faria Afrin Niha') — update if your teacher is different.",
  },
  teacherDesignation: {
    label: "Teacher designation",
    section: "teacher",
    defaults: ["lecturer"],
    message: "Still set to default designation ('Lecturer') — verify your teacher's designation.",
  },
};

export type ValidationReport = {
  errors: Record<string, string>;
  warnings: Record<string, string>;
  errorCount: number;
  warningCount: number;
  sectionErrors: Record<SectionKey, number>;
  sectionWarnings: Record<SectionKey, number>;
  isValid: boolean;
};

/**
 * Checks whether a given field has an unchanged default value from the template.
 */
export function checkUnchangedDefault(key: string, value: string): string | null {
  const meta = SAMPLE_DEFAULT_VALUES[key];
  if (!meta) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null; // If empty, required error handles it
  if (meta.defaults.includes(trimmed)) {
    return meta.message;
  }
  return null;
}

/**
 * Validates the full cover data against required fields and detects unchanged defaults.
 */
export function validateCoverData(data: CoverData): ValidationReport {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const sectionErrors: Record<SectionKey, number> = {
    institution: 0,
    document: 0,
    student: 0,
    teacher: 0,
    dates: 0,
  };
  const sectionWarnings: Record<SectionKey, number> = {
    institution: 0,
    document: 0,
    student: 0,
    teacher: 0,
    dates: 0,
  };

  const values: Record<string, { val: string; section: SectionKey; label: string }> = {
    university: { val: data.institution.university, section: "institution", label: "University" },
    department: { val: data.institution.department, section: "institution", label: "Department / Faculty" },
    logo: { val: data.institution.logo, section: "institution", label: "University logo" },
    courseTitle: { val: data.document.courseTitle, section: "document", label: "Course title" },
    courseCode: { val: data.document.courseCode, section: "document", label: "Course code" },
    topic: { val: data.document.topic, section: "document", label: "Topic" },
    studentName: { val: data.student.name, section: "student", label: "Full name" },
    studentId: { val: data.student.studentId, section: "student", label: "Student ID" },
    program: { val: data.student.program, section: "student", label: "Program" },
    batch: { val: data.student.batch, section: "student", label: "Batch" },
    semester: { val: data.student.semester, section: "student", label: "Semester" },
    section: { val: data.student.section, section: "student", label: "Section / Group" },
    teacherName: { val: data.teacher.name, section: "teacher", label: "Teacher name" },
    teacherDesignation: { val: data.teacher.designation, section: "teacher", label: "Teacher designation" },
    teacherDepartment: { val: data.teacher.department, section: "teacher", label: "Teacher department" },
    teacherInstitution: { val: data.teacher.institution, section: "teacher", label: "Teacher institution" },
    submissionDate: { val: data.dates.submission, section: "dates", label: "Date of submission" },
  };

  // Check required fields
  for (const field of PDF_REQUIRED_FIELDS) {
    const item = values[field.key];
    if (!item || !item.val.trim()) {
      errors[field.key] = `${field.label} is required.`;
      sectionErrors[field.section]++;
    }
  }

  // Check group members if group submission is enabled
  if (data.group.enabled) {
    if (data.group.members.length === 0) {
      errors["groupMembers"] = "At least one group member is required when group submission is enabled.";
      sectionErrors.student++;
    } else {
      data.group.members.forEach((member, index) => {
        if (!member.name.trim() || !member.studentId.trim()) {
          errors[`groupMember_${member.id}`] = `Group member ${index + 1} needs both name and ID.`;
          sectionErrors.student++;
        }
      });
    }
  }

  // Check for unchanged defaults on fields that are filled
  for (const [key, meta] of Object.entries(SAMPLE_DEFAULT_VALUES)) {
    const item = values[key];
    if (item && item.val.trim() && !errors[key]) {
      const warnMsg = checkUnchangedDefault(key, item.val);
      if (warnMsg) {
        warnings[key] = warnMsg;
        sectionWarnings[meta.section]++;
      }
    }
  }

  return {
    errors,
    warnings,
    errorCount: Object.keys(errors).length,
    warningCount: Object.keys(warnings).length,
    sectionErrors,
    sectionWarnings,
    isValid: Object.keys(errors).length === 0,
  };
}
