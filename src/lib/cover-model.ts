import { formatDate } from "@/lib/date";
import type { CoverData, CoverSettings, CoverState, FieldKey, SectionId } from "@/lib/schema";

export type Row = { key: FieldKey; label: string; value: string };

/**
 * Turns state into the rows each template renders. A row only appears when the
 * field is enabled *and* has a value, so an unfilled cover never shows empty
 * table rows — and the preview stays honest about what will print.
 */
function collect(
  keys: FieldKey[],
  values: Partial<Record<FieldKey, string>>,
  settings: CoverSettings,
): Row[] {
  const rows: Row[] = [];
  for (const key of keys) {
    const field = settings.fields[key];
    if (!field?.show) continue;
    const value = (values[key] ?? "").trim();
    if (!value) continue;
    rows.push({ key, label: field.label.trim() || key, value });
  }
  return rows;
}

export type CoverModel = {
  heading: string;
  documentType: string;
  university: string;
  department: string;
  tagline: string;
  logo: string;
  topic: string;
  courseRows: Row[];
  studentRows: Row[];
  teacherRows: Row[];
  dateRows: Row[];
  groupMembers: { name: string; studentId: string }[];
  /** Teacher name is rendered larger than the other teacher rows. */
  teacherName: string;
  footer: string;
  /** Nothing typed anywhere — templates use this to show placeholder hints. */
  isEmpty: boolean;
};

export function buildModel({ data, settings }: CoverState): CoverModel {
  const { document: doc, student, teacher, dates, institution, group } = data;

  const heading = (doc.heading || `${doc.type} On`).trim();

  const courseRows = collect(
    ["courseTitle", "courseCode", "assignmentNo"],
    {
      courseTitle: doc.courseTitle,
      courseCode: doc.courseCode,
      assignmentNo: doc.assignmentNo,
    },
    settings,
  );

  const studentRows = collect(
    [
      "studentName",
      "studentId",
      "program",
      "batch",
      "semester",
      "section",
      "studentEmail",
      "studentPhone",
    ],
    {
      studentName: student.name,
      studentId: student.studentId,
      program: student.program,
      batch: student.batch,
      semester: student.semester,
      section: student.section,
      studentEmail: student.email,
      studentPhone: student.phone,
    },
    settings,
  );

  // The teacher's name gets its own emphasis treatment, so it is excluded here.
  const teacherRows = collect(
    ["teacherDesignation", "teacherDepartment", "teacherInstitution", "teacherEmail"],
    {
      teacherDesignation: teacher.designation,
      teacherDepartment: teacher.department,
      teacherInstitution: teacher.institution,
      teacherEmail: teacher.email,
    },
    settings,
  );

  const dateRows = collect(
    ["submissionDate", "dueDate"],
    {
      submissionDate: formatDate(dates.submission, settings.extras.dateFormat),
      dueDate: formatDate(dates.due, settings.extras.dateFormat),
    },
    settings,
  );

  const groupMembers = group.enabled
    ? group.members
        .map((m) => ({ name: m.name.trim(), studentId: m.studentId.trim() }))
        .filter((m) => m.name || m.studentId)
    : [];

  const showTopic = settings.fields.topic.show && doc.topic.trim() !== "";
  const teacherName = settings.fields.teacherName.show ? teacher.name.trim() : "";

  const isEmpty =
    !courseRows.length &&
    !studentRows.length &&
    !teacherRows.length &&
    !dateRows.length &&
    !groupMembers.length &&
    !teacherName &&
    !showTopic &&
    !institution.university.trim();

  return {
    heading,
    documentType: doc.type.trim(),
    university: institution.university.trim(),
    department: institution.department.trim(),
    tagline: institution.tagline.trim(),
    logo: institution.logo,
    topic: showTopic ? doc.topic.trim() : "",
    courseRows,
    studentRows,
    teacherRows,
    dateRows,
    groupMembers,
    teacherName,
    footer: settings.extras.footer.trim(),
    isEmpty,
  };
}

export const SECTION_TITLES: Record<Exclude<SectionId, "heading">, string> = {
  course: "Course Details",
  submittedBy: "Submitted By",
  submittedTo: "Submitted To",
  date: "Date",
};

/** Suggested PDF/attachment filename, safe for any filesystem. */
export function suggestedFilename(data: CoverData): string {
  const parts = [
    data.document.courseCode,
    data.document.type,
    data.student.studentId || data.student.name,
  ]
    .map((part) => part.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);

  const stem = parts.join("-") || "assignment-cover";
  return `${stem.slice(0, 100)}.pdf`;
}
