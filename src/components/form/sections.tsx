"use client";

import { CalendarDays, GraduationCap, School, UserRound, Users } from "lucide-react";

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
import { Plus, Trash2 } from "lucide-react";

const MAX_MEMBERS = 8;

export function InstitutionSection() {
  const { data, patchData } = useCoverStore();
  const { institution } = data;

  return (
    <Accordion
      title="Institution"
      description={institution.university || "University, department and logo"}
      icon={<School className="size-4" />}
      defaultOpen
    >
      <Stack>
        <TextField
          label="University"
          placeholder="Bangladesh University"
          value={institution.university}
          onValueChange={(university) => patchData("institution", { university })}
        />
        <TextField
          label="Department / Faculty"
          placeholder="Department of CSE"
          value={institution.department}
          onValueChange={(department) => patchData("institution", { department })}
        />
        <TextField
          label="Tagline (optional)"
          placeholder="Est. 2001 · Dhaka"
          value={institution.tagline}
          onValueChange={(tagline) => patchData("institution", { tagline })}
        />
        <LogoPicker
          value={institution.logo}
          onChange={(logo) => patchData("institution", { logo })}
        />
      </Stack>
    </Accordion>
  );
}

export function DocumentSection() {
  const { data, patchData } = useCoverStore();
  const { document: doc } = data;

  return (
    <Accordion
      title="Assignment"
      description={doc.courseTitle || doc.topic || "Course, code and topic"}
      icon={<GraduationCap className="size-4" />}
      defaultOpen
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
            value={doc.courseTitle}
            onValueChange={(courseTitle) => patchData("document", { courseTitle })}
          />
          <TextField
            label="Course code"
            placeholder="CSE-3204"
            value={doc.courseCode}
            onValueChange={(courseCode) => patchData("document", { courseCode })}
          />
        </Grid>

        <TextAreaField
          label="Topic"
          placeholder="Combinational Logic Using Multiplexers, PLA, and PAL"
          value={doc.topic}
          onValueChange={(topic) => patchData("document", { topic })}
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
  const { data, patchData, addMember, updateMember, removeMember } = useCoverStore();
  const { student, group } = data;

  return (
    <Accordion
      title="Submitted By"
      description={student.name || "Your details"}
      icon={<UserRound className="size-4" />}
      defaultOpen
    >
      <Stack>
        <Grid>
          <TextField
            label="Full name"
            placeholder="A. A. M Ashfatul Islam"
            value={student.name}
            onValueChange={(name) => patchData("student", { name })}
            autoComplete="name"
          />
          <TextField
            label="Student ID"
            placeholder="202411068038"
            value={student.studentId}
            onValueChange={(studentId) => patchData("student", { studentId })}
            inputMode="numeric"
          />
        </Grid>

        <Grid>
          <TextField
            label="Program"
            placeholder="B.Sc. in CSE"
            value={student.program}
            onValueChange={(program) => patchData("student", { program })}
          />
          <TextField
            label="Batch"
            placeholder="68 - Evening"
            value={student.batch}
            onValueChange={(batch) => patchData("student", { batch })}
          />
        </Grid>

        <Grid>
          <TextField
            label="Semester"
            placeholder="Summer 2025"
            value={student.semester}
            onValueChange={(semester) => patchData("student", { semester })}
          />
          <TextField
            label="Section / Group"
            placeholder="B"
            value={student.section}
            onValueChange={(section) => patchData("student", { section })}
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
              {group.members.map((member, index) => (
                <div key={member.id} className="flex items-end gap-2">
                  <span className="pb-2.5 text-xs text-[var(--ui-muted)] tabular-nums">
                    {index + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={index === 0 ? "Name" : undefined}
                      placeholder="Member name"
                      value={member.name}
                      onValueChange={(name) => updateMember(member.id, { name })}
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <TextField
                      label={index === 0 ? "ID" : undefined}
                      placeholder="ID"
                      value={member.studentId}
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
  const { data, patchData } = useCoverStore();
  const { teacher } = data;

  return (
    <Accordion
      title="Submitted To"
      description={teacher.name || "Your instructor"}
      icon={<Users className="size-4" />}
      defaultOpen
    >
      <Stack>
        <Grid>
          <TextField
            label="Name"
            placeholder="Faria Afrin Niha"
            value={teacher.name}
            onValueChange={(name) => patchData("teacher", { name })}
          />
          <TextField
            label="Designation"
            placeholder="Lecturer"
            value={teacher.designation}
            onValueChange={(designation) => patchData("teacher", { designation })}
          />
        </Grid>

        <Grid>
          <TextField
            label="Department"
            placeholder="Department of CSE"
            value={teacher.department}
            onValueChange={(department) => patchData("teacher", { department })}
          />
          <TextField
            label="Institution"
            placeholder="Bangladesh University"
            value={teacher.institution}
            onValueChange={(institution) => patchData("teacher", { institution })}
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
  const { data, patchData } = useCoverStore();
  const { dates } = data;

  return (
    <Accordion
      title="Dates"
      description={dates.submission || "Submission date"}
      icon={<CalendarDays className="size-4" />}
      defaultOpen
    >
      <Stack>
        <Grid>
          <TextField
            label="Date of submission"
            type="date"
            value={dates.submission}
            onValueChange={(submission) => patchData("dates", { submission })}
            action={
              <button
                type="button"
                onClick={() => patchData("dates", { submission: todayIso() })}
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
