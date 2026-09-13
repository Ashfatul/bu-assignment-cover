"use client";

import {
  AlertCircle,
  CalendarDays,
  GraduationCap,
  Plus,
  School,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { LogoPicker } from "@/components/form/LogoPicker";
import {
  Accordion,
  BUTTON_GHOST,
  BUTTON_SECONDARY,
  Grid,
  SelectField,
  Stack,
  Switch,
  TextAreaField,
  TextField,
} from "@/components/ui/controls";
import { todayIso } from "@/lib/date";
import { DOCUMENT_TYPES } from "@/lib/schema";
import { useCoverStore } from "@/lib/store";

const MAX_MEMBERS = 8;

export function InstitutionSection() {
  const {
    data,
    patchData,
    settings,
    patchSettings,
    validation,
    showValidation,
    touchedFields,
    touchField,
    openSections,
    setSectionOpen,
  } = useCoverStore();
  const { institution } = data;
  const isWatermarkOn = settings.extras.watermark === "logo";

  const getError = (key: string) =>
    showValidation || touchedFields[key] ? validation.errors[key] ?? null : null;
  const getWarning = (key: string) => validation.warnings[key] ?? null;

  return (
    <Accordion
      title="Institution"
      description={institution.university || "University, department and logo"}
      icon={<School className="size-4" />}
      isOpen={openSections.institution}
      onOpenChange={(open) => setSectionOpen("institution", open)}
      errorCount={showValidation ? validation.sectionErrors.institution : 0}
      warningCount={validation.sectionWarnings.institution}
    >
      <Stack>
        <TextField
          label="University"
          placeholder="Bangladesh University"
          required
          value={institution.university}
          error={getError("university")}
          warning={getWarning("university")}
          onValueChange={(university) => {
            touchField("university");
            patchData("institution", { university });
          }}
          onBlur={() => touchField("university")}
        />
        <TextField
          label="Department / Faculty"
          placeholder="Department of CSE"
          required
          value={institution.department}
          error={getError("department")}
          warning={getWarning("department")}
          onValueChange={(department) => {
            touchField("department");
            patchData("institution", { department });
          }}
          onBlur={() => touchField("department")}
        />
        <TextField
          label="Tagline (optional)"
          placeholder="Est. 2001 · Dhaka"
          value={institution.tagline}
          onValueChange={(tagline) => patchData("institution", { tagline })}
        />
        <LogoPicker
          value={institution.logo}
          required
          error={getError("logo")}
          onChange={(logo) => {
            touchField("logo");
            patchData("institution", { logo });
          }}
        />
        <Switch
          label="Placeholder behind (watermark)"
          hint="Show this logo as a faded background watermark behind the cover"
          checked={isWatermarkOn}
          disabled={!institution.logo}
          onCheckedChange={(checked) =>
            patchSettings("extras", { watermark: checked ? "logo" : "off" })
          }
        />
      </Stack>
    </Accordion>
  );
}

export function DocumentSection() {
  const {
    data,
    patchData,
    validation,
    showValidation,
    touchedFields,
    touchField,
    openSections,
    setSectionOpen,
  } = useCoverStore();
  const { document: doc } = data;

  const getError = (key: string) =>
    showValidation || touchedFields[key] ? validation.errors[key] ?? null : null;
  const getWarning = (key: string) => validation.warnings[key] ?? null;

  return (
    <Accordion
      title="Assignment"
      description={doc.courseTitle || doc.topic || "Course, code and topic"}
      icon={<GraduationCap className="size-4" />}
      isOpen={openSections.document}
      onOpenChange={(open) => setSectionOpen("document", open)}
      errorCount={showValidation ? validation.sectionErrors.document : 0}
      warningCount={validation.sectionWarnings.document}
    >
      <Stack>
        <Grid>
          <SelectField
            label="Document type"
            value={
              DOCUMENT_TYPES.includes(doc.type as (typeof DOCUMENT_TYPES)[number])
                ? doc.type
                : "custom"
            }
            onValueChange={(type) => {
              if (type === "custom") {
                patchData("document", { type: "" });
                return;
              }
              // Keep the heading in step unless the user has customised it.
              const heading = `${type} On`;
              patchData("document", { type, heading });
            }}
            options={[
              ...DOCUMENT_TYPES.map((value) => ({ value, label: value })),
              { value: "custom", label: "Custom…" },
            ]}
          />
          <TextField
            label="Heading on the cover"
            placeholder="Assignment On"
            value={doc.heading}
            onValueChange={(heading) => patchData("document", { heading })}
            hint="Shown above the topic"
          />
        </Grid>

        {!DOCUMENT_TYPES.includes(doc.type as (typeof DOCUMENT_TYPES)[number]) && (
          <TextField
            label="Custom document type"
            placeholder="Case Study"
            value={doc.type}
            onValueChange={(type) => patchData("document", { type })}
          />
        )}

        <Grid>
          <TextField
            label="Course title"
            placeholder="Digital System Design Lab"
            required
            value={doc.courseTitle}
            error={getError("courseTitle")}
            warning={getWarning("courseTitle")}
            onValueChange={(courseTitle) => {
              touchField("courseTitle");
              patchData("document", { courseTitle });
            }}
            onBlur={() => touchField("courseTitle")}
          />
          <TextField
            label="Course code"
            placeholder="CSE-3204"
            required
            value={doc.courseCode}
            error={getError("courseCode")}
            warning={getWarning("courseCode")}
            onValueChange={(courseCode) => {
              touchField("courseCode");
              patchData("document", { courseCode });
            }}
            onBlur={() => touchField("courseCode")}
          />
        </Grid>

        <TextAreaField
          label="Topic"
          placeholder="Combinational Logic Using Multiplexers, PLA, and PAL"
          required
          value={doc.topic}
          error={getError("topic")}
          warning={getWarning("topic")}
          onValueChange={(topic) => {
            touchField("topic");
            patchData("document", { topic });
          }}
          onBlur={() => touchField("topic")}
          rows={2}
        />

        <TextField
          label="Assignment number (optional)"
          placeholder="03"
          value={doc.assignmentNo}
          onValueChange={(assignmentNo) => patchData("document", { assignmentNo })}
          hint="Turn the row on under Advanced → Fields to show it"
        />
      </Stack>
    </Accordion>
  );
}

export function StudentSection() {
  const {
    data,
    patchData,
    addMember,
    updateMember,
    removeMember,
    validation,
    showValidation,
    touchedFields,
    touchField,
    openSections,
    setSectionOpen,
  } = useCoverStore();
  const { student, group } = data;

  const getError = (key: string) =>
    showValidation || touchedFields[key] ? validation.errors[key] ?? null : null;
  const getWarning = (key: string) => validation.warnings[key] ?? null;

  return (
    <Accordion
      title="Submitted By"
      description={student.name || "Your details"}
      icon={<UserRound className="size-4" />}
      isOpen={openSections.student}
      onOpenChange={(open) => setSectionOpen("student", open)}
      errorCount={showValidation ? validation.sectionErrors.student : 0}
      warningCount={validation.sectionWarnings.student}
    >
      <Stack>
        <Grid>
          <TextField
            label="Full name"
            placeholder="A. A. M Ashfatul Islam"
            required
            value={student.name}
            error={getError("studentName")}
            warning={getWarning("studentName")}
            onValueChange={(name) => {
              touchField("studentName");
              patchData("student", { name });
            }}
            onBlur={() => touchField("studentName")}
            autoComplete="name"
          />
          <TextField
            label="Student ID"
            placeholder="202411068038"
            required
            value={student.studentId}
            error={getError("studentId")}
            warning={getWarning("studentId")}
            onValueChange={(studentId) => {
              touchField("studentId");
              patchData("student", { studentId });
            }}
            onBlur={() => touchField("studentId")}
            inputMode="numeric"
          />
        </Grid>

        <Grid>
          <TextField
            label="Program"
            placeholder="B.Sc. in CSE"
            required
            value={student.program}
            error={getError("program")}
            warning={getWarning("program")}
            onValueChange={(program) => {
              touchField("program");
              patchData("student", { program });
            }}
            onBlur={() => touchField("program")}
          />
          <TextField
            label="Batch"
            placeholder="68 - Evening"
            required
            value={student.batch}
            error={getError("batch")}
            warning={getWarning("batch")}
            onValueChange={(batch) => {
              touchField("batch");
              patchData("student", { batch });
            }}
            onBlur={() => touchField("batch")}
          />
        </Grid>

        <Grid>
          <TextField
            label="Semester"
            placeholder="Summer 2025"
            required
            value={student.semester}
            error={getError("semester")}
            warning={getWarning("semester")}
            onValueChange={(semester) => {
              touchField("semester");
              patchData("student", { semester });
            }}
            onBlur={() => touchField("semester")}
          />
          <TextField
            label="Section / Group"
            placeholder="B"
            required
            value={student.section}
            error={getError("section")}
            warning={getWarning("section")}
            onValueChange={(section) => {
              touchField("section");
              patchData("student", { section });
            }}
            onBlur={() => touchField("section")}
          />
        </Grid>

        <Grid>
          <TextField
            label="Email (optional)"
            type="email"
            placeholder="you@example.com"
            value={student.email}
            onValueChange={(email) => patchData("student", { email })}
            autoComplete="email"
          />
          <TextField
            label="Phone (optional)"
            type="tel"
            placeholder="+8801XXXXXXXXX"
            value={student.phone}
            onValueChange={(phone) => patchData("student", { phone })}
          />
        </Grid>

        <div className="rounded-lg border border-[var(--ui-line)] p-3">
          <Switch
            label="Group submission"
            hint="Adds a list of team members under your details"
            checked={group.enabled}
            onCheckedChange={(enabled) => patchData("group", { enabled })}
          />

          {group.enabled && (
            <div className="mt-3 flex flex-col gap-2">
              {showValidation && validation.errors["groupMembers"] && (
                <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{validation.errors["groupMembers"]}</span>
                </p>
              )}

              {group.members.map((member, index) => (
                <div key={member.id} className="flex items-end gap-2">
                  <span className="pb-2.5 text-xs text-[var(--ui-muted)] tabular-nums">
                    {index + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={index === 0 ? "Name" : undefined}
                      placeholder="Member name"
                      required
                      value={member.name}
                      error={
                        showValidation && !member.name.trim()
                          ? "Name is required"
                          : null
                      }
                      onValueChange={(name) => updateMember(member.id, { name })}
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <TextField
                      label={index === 0 ? "ID" : undefined}
                      placeholder="ID"
                      required
                      value={member.studentId}
                      error={
                        showValidation && !member.studentId.trim()
                          ? "ID is required"
                          : null
                      }
                      onValueChange={(studentId) => updateMember(member.id, { studentId })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    aria-label={`Remove member ${index + 1}`}
                    className="mb-0.5 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addMember}
                disabled={group.members.length >= MAX_MEMBERS}
                className={`${BUTTON_SECONDARY} self-start px-3 py-1.5 text-xs`}
              >
                <Plus className="size-3.5" />
                Add member
              </button>

              {group.members.length >= MAX_MEMBERS && (
                <p className="text-xs text-[var(--ui-muted)]">
                  Eight members is the most that fits cleanly on one page.
                </p>
              )}
            </div>
          )}
        </div>
      </Stack>
    </Accordion>
  );
}

export function TeacherSection() {
  const {
    data,
    patchData,
    validation,
    showValidation,
    touchedFields,
    touchField,
    openSections,
    setSectionOpen,
  } = useCoverStore();
  const { teacher } = data;

  const getError = (key: string) =>
    showValidation || touchedFields[key] ? validation.errors[key] ?? null : null;
  const getWarning = (key: string) => validation.warnings[key] ?? null;

  return (
    <Accordion
      title="Submitted To"
      description={teacher.name || "Your instructor"}
      icon={<Users className="size-4" />}
      isOpen={openSections.teacher}
      onOpenChange={(open) => setSectionOpen("teacher", open)}
      errorCount={showValidation ? validation.sectionErrors.teacher : 0}
      warningCount={validation.sectionWarnings.teacher}
    >
      <Stack>
        <Grid>
          <TextField
            label="Name"
            placeholder="Faria Afrin Niha"
            required
            value={teacher.name}
            error={getError("teacherName")}
            warning={getWarning("teacherName")}
            onValueChange={(name) => {
              touchField("teacherName");
              patchData("teacher", { name });
            }}
            onBlur={() => touchField("teacherName")}
          />
          <TextField
            label="Designation"
            placeholder="Lecturer"
            required
            value={teacher.designation}
            error={getError("teacherDesignation")}
            warning={getWarning("teacherDesignation")}
            onValueChange={(designation) => {
              touchField("teacherDesignation");
              patchData("teacher", { designation });
            }}
            onBlur={() => touchField("teacherDesignation")}
          />
        </Grid>

        <Grid>
          <TextField
            label="Department"
            placeholder="Department of CSE"
            required
            value={teacher.department}
            error={getError("teacherDepartment")}
            warning={getWarning("teacherDepartment")}
            onValueChange={(department) => {
              touchField("teacherDepartment");
              patchData("teacher", { department });
            }}
            onBlur={() => touchField("teacherDepartment")}
          />
          <TextField
            label="Institution"
            placeholder="Bangladesh University"
            required
            value={teacher.institution}
            error={getError("teacherInstitution")}
            warning={getWarning("teacherInstitution")}
            onValueChange={(institution) => {
              touchField("teacherInstitution");
              patchData("teacher", { institution });
            }}
            onBlur={() => touchField("teacherInstitution")}
          />
        </Grid>

        <TextField
          label="Email (optional)"
          type="email"
          placeholder="instructor@example.edu"
          value={teacher.email}
          onValueChange={(email) => patchData("teacher", { email })}
        />
      </Stack>
    </Accordion>
  );
}

export function DatesSection() {
  const {
    data,
    patchData,
    validation,
    showValidation,
    touchedFields,
    touchField,
    openSections,
    setSectionOpen,
  } = useCoverStore();
  const { dates } = data;

  const getError = (key: string) =>
    showValidation || touchedFields[key] ? validation.errors[key] ?? null : null;
  const getWarning = (key: string) => validation.warnings[key] ?? null;

  return (
    <Accordion
      title="Dates"
      description={dates.submission || "Submission date"}
      icon={<CalendarDays className="size-4" />}
      isOpen={openSections.dates}
      onOpenChange={(open) => setSectionOpen("dates", open)}
      errorCount={showValidation ? validation.sectionErrors.dates : 0}
      warningCount={validation.sectionWarnings.dates}
    >
      <Stack>
        <Grid>
          <TextField
            label="Date of submission"
            type="date"
            required
            value={dates.submission}
            error={getError("submissionDate")}
            warning={getWarning("submissionDate")}
            onValueChange={(submission) => {
              touchField("submissionDate");
              patchData("dates", { submission });
            }}
            onBlur={() => touchField("submissionDate")}
            action={
              <button
                type="button"
                onClick={() => {
                  touchField("submissionDate");
                  patchData("dates", { submission: todayIso() });
                }}
                className={`${BUTTON_GHOST} px-2 py-0.5 text-xs`}
              >
                Today
              </button>
            }
          />
          <TextField
            label="Due date (optional)"
            type="date"
            value={dates.due}
            onValueChange={(due) => patchData("dates", { due })}
            hint="Turn the row on under Advanced → Fields"
          />
        </Grid>
      </Stack>
    </Accordion>
  );
}
