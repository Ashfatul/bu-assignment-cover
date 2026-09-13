"use client";

import {
  ArrowDown,
  ArrowUp,
  Braces,
  Download,
  Link2,
  Palette,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef } from "react";

import {
  Accordion,
  BUTTON_SECONDARY,
  ColorField,
  Divider,
  Grid,
  SelectField,
  Segmented,
  SliderField,
  Stack,
  Switch,
  TextField,
} from "@/components/ui/controls";
import { useToast } from "@/components/ui/Toast";
import { downloadBlob } from "@/lib/pdf";
import {
  BORDER_STYLES,
  DATE_FORMATS,
  DENSITIES,
  FIELD_KEYS,
  LOGO_POSITIONS,
  MARGINS,
  PAPERS,
  SCALES,
  SECTION_LABELS,
  TEMPLATES,
  TEMPLATE_LABELS,
  WATERMARK_MODES,
  type BorderStyle,
  type DateFormat,
  type Density,
  type FieldKey,
  type FontPair,
  type LogoPosition,
  type MarginPreset,
  type Paper,
  type Scale,
  type SectionId,
  type TemplateId,
  type WatermarkMode,
} from "@/lib/schema";
import { buildShareUrl, exportStateJson, importStateJson } from "@/lib/share";
import { useCoverStore } from "@/lib/store";

const TEMPLATE_BLURBS: Record<TemplateId, string> = {
  "modern-card": "Accent rail, filled title band, borderless data blocks.",
  "classic-bordered": "The familiar ruled-table cover, tidied up.",
  "minimal-rule": "Typographic and quiet. The topic is the hero.",
};

/** Groups the field toggles the same way the cover groups them. */
const FIELD_GROUPS: { title: string; keys: FieldKey[] }[] = [
  { title: "Course", keys: ["courseTitle", "courseCode", "topic", "assignmentNo"] },
  {
    title: "Submitted By",
    keys: [
      "studentName",
      "studentId",
      "program",
      "batch",
      "semester",
      "section",
      "studentEmail",
      "studentPhone",
    ],
  },
  {
    title: "Submitted To",
    keys: [
      "teacherName",
      "teacherDesignation",
      "teacherDepartment",
      "teacherInstitution",
      "teacherEmail",
    ],
  },
  { title: "Dates", keys: ["submissionDate", "dueDate"] },
];

export function AdvancedPanel() {
  return (
    <>
      <TemplateSection />
      <ThemeSection />
      <LayoutSection />
      <FieldsSection />
      <ExtrasSection />
      <PortabilitySection />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function TemplateSection() {
  const { settings, setTemplate } = useCoverStore();

  return (
    <Accordion
      title="Template"
      description={TEMPLATE_LABELS[settings.template]}
      icon={<Sparkles className="size-4" />}
      defaultOpen
    >
      <div className="grid gap-2">
        {TEMPLATES.map((id) => {
          const active = settings.template === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTemplate(id)}
              aria-pressed={active}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                active
                  ? "border-gray-900 bg-gray-50"
                  : "border-[var(--ui-line)] hover:border-gray-300"
              }`}
            >
              <TemplateThumb id={id} accent={settings.theme.accent} />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{TEMPLATE_LABELS[id]}</span>
                <span className="block text-xs text-[var(--ui-muted)]">
                  {TEMPLATE_BLURBS[id]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Accordion>
  );
}

/** Tiny abstract preview so the three options are distinguishable at a glance. */
function TemplateThumb({ id, accent }: { id: TemplateId; accent: string }) {
  return (
    <span className="relative flex h-14 w-10 shrink-0 flex-col gap-1 overflow-hidden rounded border border-[var(--ui-line)] bg-white p-1">
      {id === "modern-card" && (
        <>
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
          <span className="ml-1.5 h-2 rounded-sm" style={{ background: accent }} />
          <span className="ml-1.5 h-3 rounded-sm bg-gray-100" />
          <span className="ml-1.5 h-3 rounded-sm bg-gray-100" />
        </>
      )}
      {id === "classic-bordered" && (
        <>
          <span className="mx-auto h-2 w-4 rounded-full bg-gray-200" />
          <span className="h-1.5" style={{ background: accent }} />
          <span className="flex-1 border border-gray-200" />
          <span className="h-1.5" style={{ background: accent }} />
        </>
      )}
      {id === "minimal-rule" && (
        <>
          <span className="h-px bg-gray-300" />
          <span className="h-3 w-6 rounded-sm bg-gray-200" />
          <span className="h-px w-3" style={{ background: accent }} />
          <span className="mt-auto h-px bg-gray-200" />
          <span className="h-px bg-gray-200" />
        </>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

function ThemeSection() {
  const { settings, patchSettings, resetSettingsGroup } = useCoverStore();
  const { theme } = settings;

  return (
    <Accordion
      title="Theme"
      description="Colour, type and borders"
      icon={<Palette className="size-4" />}
      onReset={() => resetSettingsGroup("theme")}
    >
      <Stack>
        <ColorField
          label="Accent colour"
          value={theme.accent}
          onValueChange={(accent) => patchSettings("theme", { accent })}
        />

        <Grid>
          <ColorField
            label="Text"
            value={theme.text}
            onValueChange={(text) => patchSettings("theme", { text })}
            swatches={["#111827", "#1F2937", "#374151", "#000000"]}
          />
          <ColorField
            label="Secondary text"
            value={theme.muted}
            onValueChange={(muted) => patchSettings("theme", { muted })}
            swatches={["#6B7280", "#4B5563", "#9CA3AF", "#374151"]}
          />
        </Grid>

        <Divider />

        <Segmented<FontPair>
          label="Typeface"
          value={theme.fontPair}
          onValueChange={(fontPair) => patchSettings("theme", { fontPair })}
          options={[
            { value: "mixed", label: "Mixed" },
            { value: "serif", label: "Serif" },
            { value: "sans", label: "Sans" },
          ]}
        />

        <Segmented<Scale>
          label="Text size"
          value={theme.fontScale}
          onValueChange={(fontScale) => patchSettings("theme", { fontScale })}
          options={SCALES.map((value) => ({
            value,
            label: { s: "Small", m: "Normal", l: "Large" }[value],
          }))}
        />

        <Segmented<BorderStyle>
          label="Borders"
          value={theme.borderStyle}
          onValueChange={(borderStyle) => patchSettings("theme", { borderStyle })}
          options={BORDER_STYLES.map((value) => ({
            value,
            label: { none: "None", hairline: "Hairline", solid: "Solid" }[value],
          }))}
        />

        <SliderField
          label="Corner radius"
          value={theme.radius}
          min={0}
          max={8}
          step={0.5}
          unit=" mm"
          onValueChange={(radius) => patchSettings("theme", { radius })}
        />
      </Stack>
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */

function LayoutSection() {
  const { settings, patchSettings, resetSettingsGroup } = useCoverStore();
  const { layout } = settings;

  const move = (id: SectionId, direction: -1 | 1) => {
    const order = [...layout.sectionOrder];
    const from = order.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    patchSettings("layout", { sectionOrder: order });
  };

  return (
    <Accordion
      title="Layout"
      description="Paper, margins, logo and order"
      icon={<Ruler className="size-4" />}
      onReset={() => resetSettingsGroup("layout")}
    >
      <Stack>
        <Grid>
          <SelectField
            label="Paper size"
            value={layout.paper}
            onValueChange={(paper) => patchSettings("layout", { paper: paper as Paper })}
            options={PAPERS.map((value) => ({
              value,
              label: value === "A4" ? "A4 (210×297 mm)" : "Letter (8.5×11 in)",
            }))}
          />
          <SelectField
            label="Date format"
            value={settings.extras.dateFormat}
            onValueChange={(value) =>
              patchSettings("extras", { dateFormat: value as DateFormat })
            }
            options={DATE_FORMATS.map((value) => ({
              value,
              label: {
                "DD/MM/YYYY": "15/05/2026",
                "MM/DD/YYYY": "05/15/2026",
                "D MMMM YYYY": "15 May 2026",
                "YYYY-MM-DD": "2026-05-15",
              }[value],
            }))}
          />
        </Grid>

        <Segmented<MarginPreset>
          label="Page margin"
          value={layout.margin}
          onValueChange={(margin) => patchSettings("layout", { margin, marginMm: null })}
          options={MARGINS.map((value) => ({
            value,
            label: { narrow: "Narrow", normal: "Normal", wide: "Wide" }[value],
          }))}
        />

        <SliderField
          label="Custom margin"
          value={layout.marginMm ?? { narrow: 14, normal: 20, wide: 28 }[layout.margin]}
          min={8}
          max={40}
          step={1}
          unit=" mm"
          onValueChange={(marginMm) => patchSettings("layout", { marginMm })}
        />

        <Segmented<Density>
          label="Spacing"
          value={layout.density}
          onValueChange={(density) => patchSettings("layout", { density })}
          options={DENSITIES.map((value) => ({
            value,
            label: { compact: "Compact", normal: "Normal", airy: "Airy" }[value],
          }))}
        />

        <Divider />

        <Segmented<LogoPosition>
          label="Logo position"
          value={layout.logoPosition}
          onValueChange={(logoPosition) => patchSettings("layout", { logoPosition })}
          options={LOGO_POSITIONS.map((value) => ({
            value,
            label: { center: "Center", left: "Left", right: "Right" }[value],
          }))}
        />

        <SliderField
          label="Logo size"
          value={layout.logoSize}
          min={10}
          max={70}
          step={1}
          unit=" mm"
          onValueChange={(logoSize) => patchSettings("layout", { logoSize })}
        />

        <Divider label="Section order" />

        <ul className="flex flex-col gap-1.5">
          {layout.sectionOrder.map((id, index) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-lg border border-[var(--ui-line)] px-3 py-2"
            >
              <span className="flex-1 text-sm">{SECTION_LABELS[id]}</span>
              <button
                type="button"
                onClick={() => move(id, -1)}
                disabled={index === 0}
                aria-label={`Move ${SECTION_LABELS[id]} up`}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-[var(--ui-text)] disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(id, 1)}
                disabled={index === layout.sectionOrder.length - 1}
                aria-label={`Move ${SECTION_LABELS[id]} down`}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-[var(--ui-text)] disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </Stack>
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */

function FieldsSection() {
  const { settings, patchField, resetFieldLabel, resetSettingsGroup } = useCoverStore();

  const hiddenCount = FIELD_KEYS.filter((key) => !settings.fields[key].show).length;

  return (
    <Accordion
      title="Fields"
      description={hiddenCount ? `${hiddenCount} hidden` : "All rows shown"}
      icon={<SlidersHorizontal className="size-4" />}
      onReset={() => resetSettingsGroup("fields")}
    >
      <p className="mb-3 text-xs text-[var(--ui-muted)]">
        Turn a row off, or rename its label — handy when your department says
        &ldquo;Group&rdquo; where mine says &ldquo;Section&rdquo;. Rows with no value are hidden
        automatically.
      </p>

      <div className="flex flex-col gap-4">
        {FIELD_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-2 text-xs font-semibold tracking-wide text-[var(--ui-muted)] uppercase">
              {group.title}
            </div>
            <div className="flex flex-col gap-2">
              {group.keys.map((key) => {
                const field = settings.fields[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.show}
                      onChange={(event) => patchField(key, { show: event.target.checked })}
                      aria-label={`Show ${field.label}`}
                      className="size-4 shrink-0 rounded border-gray-300 accent-gray-900"
                    />
                    <input
                      value={field.label}
                      onChange={(event) => patchField(key, { label: event.target.value })}
                      onBlur={(event) => {
                        if (!event.target.value.trim()) resetFieldLabel(key);
                      }}
                      disabled={!field.show}
                      aria-label={`Label for ${key}`}
                      className="min-w-0 flex-1 rounded-md border border-[var(--ui-line)] px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */

function ExtrasSection() {
  const { settings, patchSettings, resetSettingsGroup, data } = useCoverStore();
  const { extras } = settings;

  return (
    <Accordion
      title="Extras"
      description="Watermark, footer, signature"
      icon={<Sparkles className="size-4" />}
      onReset={() => resetSettingsGroup("extras")}
    >
      <Stack>
        <Segmented<WatermarkMode>
          label="Watermark"
          value={extras.watermark}
          onValueChange={(watermark) => patchSettings("extras", { watermark })}
          options={WATERMARK_MODES.map((value) => ({
            value,
            label: { off: "Off", logo: "Logo", text: "Text" }[value],
          }))}
        />

        {extras.watermark === "text" && (
          <TextField
            label="Watermark text"
            placeholder={data.institution.university || "University name"}
            value={extras.watermarkText}
            onValueChange={(watermarkText) => patchSettings("extras", { watermarkText })}
          />
        )}

        {extras.watermark !== "off" && (
          <Grid>
            <SliderField
              label="Opacity"
              value={Math.round(extras.watermarkOpacity * 100)}
              min={0}
              max={30}
              step={1}
              unit="%"
              onValueChange={(value) =>
                patchSettings("extras", { watermarkOpacity: value / 100 })
              }
            />
            <SliderField
              label="Size"
              value={Math.round(extras.watermarkScale * 100)}
              min={20}
              max={150}
              step={5}
              unit="%"
              onValueChange={(value) => patchSettings("extras", { watermarkScale: value / 100 })}
            />
          </Grid>
        )}

        <Divider />

        <TextField
          label="Footer line (optional)"
          placeholder="Submitted in partial fulfilment of the course requirements"
          value={extras.footer}
          onValueChange={(footer) => patchSettings("extras", { footer })}
        />

        <Switch
          label="Signature line"
          hint="A ruled line at the bottom of the page"
          checked={extras.signatureLine}
          onCheckedChange={(signatureLine) => patchSettings("extras", { signatureLine })}
        />

        <Switch
          label="Colons after labels"
          hint="Course Title : Digital System Design Lab"
          checked={extras.showColons}
          onCheckedChange={(showColons) => patchSettings("extras", { showColons })}
        />

        <Switch
          label="Uppercase heading"
          hint="ASSIGNMENT ON vs Assignment On"
          checked={extras.uppercaseHeading}
          onCheckedChange={(uppercaseHeading) => patchSettings("extras", { uppercaseHeading })}
        />
      </Stack>
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */

function PortabilitySection() {
  const { state, settings, replaceState } = useCoverStore();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const copyShareLink = async () => {
    const url = buildShareUrl(settings);
    try {
      await navigator.clipboard.writeText(url);
      show({ tone: "success", message: "Style link copied. It carries settings only." });
    } catch {
      // Clipboard is blocked on insecure origins; show the URL instead.
      window.prompt("Copy this link", url);
    }
  };

  return (
    <Accordion
      title="Share & backup"
      description="Export settings, import a file"
      icon={<Braces className="size-4" />}
    >
      <Stack>
        <p className="text-xs text-[var(--ui-muted)]">
          The style link holds only the look and feel — never your name, ID or topic. Nothing is
          uploaded; the link is built in your browser.
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyShareLink} className={`${BUTTON_SECONDARY} text-xs`}>
            <Link2 className="size-3.5" />
            Copy style link
          </button>

          <button
            type="button"
            onClick={() => downloadBlob(exportStateJson(state), "assignment-cover.json")}
            className={`${BUTTON_SECONDARY} text-xs`}
          >
            <Download className="size-3.5" />
            Export JSON
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${BUTTON_SECONDARY} text-xs`}
          >
            <Upload className="size-3.5" />
            Import JSON
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              replaceState(await importStateJson(file));
              show({ tone: "success", message: "Cover restored from file." });
            } catch {
              show({ tone: "error", message: "That file isn't a valid cover export." });
            }
          }}
        />
      </Stack>
    </Accordion>
  );
}
