# Assignment Cover Generator — Requirements & Plan

A free, privacy-focused web app that generates professional university assignment cover pages.
Fill a form on the left, watch an A4 cover render live on the right, then print, save as PDF, or
email it. No accounts, no tracking, no paid services.

---

## 1. Goals

| Goal | What it means here |
| --- | --- |
| Professional output | Print-quality A4 cover, vector text, correct margins, looks like a designed document not a web page |
| Live editing | Every keystroke updates the preview instantly, no "generate" button |
| Simple by default | One opinionated great-looking template works for 90% of users with zero fiddling |
| Deep when needed | An "Advanced" panel for the geeky user: colors, fonts, layout variant, field visibility, custom labels |
| Free forever | No paid APIs, no paid packages, no server-side rendering farm. Free-tier SMTP only for email |
| Privacy first | All data stays in the browser. Nothing is stored server-side. No analytics, no external font/CDN calls |

Non-goals: multi-page documents, rich text editing, cloud sync, user accounts.

---

## 2. Technology choices

Keep the stack small and boring on purpose.

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 15 (App Router) + TypeScript** | One project for UI + the single email API route. Free on Vercel/self-host. Static except one route |
| Styling | **Tailwind CSS v4** | Fast, no runtime CSS-in-JS, first-class `print:` variants which we need for the print path |
| UI primitives | **Hand-rolled on native elements** — `<select>`, `<dialog>`, `<input type="color">`, `<input type="range">` | No component library at all. `<dialog>` gives the top layer, backdrop and Esc-to-close for free, so even a focus-trap dependency is unnecessary |
| State | **React `useState` + a single `useCoverStore` context**, persisted with a tiny custom `useLocalDraft` hook | No Zustand/Redux needed for one form |
| Icons | **lucide-react** (MIT) | Tree-shakeable, consistent |
| Fonts | **Self-hosted via `next/font/google`** — Inter (UI + body) + Lora (headings) | `next/font` downloads and serves them from our own origin at build time: no Google Fonts network call = privacy + reliable print rendering, without checking font binaries into the repo |
| Print / Save-as-PDF | **Native `window.print()` + a dedicated `@page` / `print:` stylesheet** | Vector text, real A4, selectable text, zero dependencies, best possible quality. "Save as PDF" is a destination in the OS print dialog |
| PDF file for email | **`html-to-image` (`toPng`, pixelRatio 3) + `jspdf`** (both MIT) | Only needed to produce an attachable file. ~90 KB gzipped total, runs fully client-side |
| Email transport | **Nodemailer** in a Next.js Route Handler, SMTP from env | Works with any free SMTP: Gmail app password, Brevo free tier (300/day), Resend free tier (3k/mo). User picks |
| Validation | **Zod** on the API route only | Server input hardening; the form itself uses light inline checks |
| Deploy | Vercel free tier, or `next start` on any VPS, or fully static export if email is disabled | |

Explicitly rejected: Puppeteer/Playwright PDF (heavy, slow cold starts, needs chromium binary), react-pdf (fights our HTML template), paid PDF APIs, any analytics SDK.

---

## 3. Information model

Derived from the reference cover (Bangladesh University, DSD Lab) and generalized.

### 3.1 Institution
- University name (`Bangladesh University`)
- Faculty / Department (`Department of CSE`)
- Logo — bundled default, plus **upload your own** (PNG/SVG/JPG, stored as data URL in local draft)
- Optional: institution address / tagline line

### 3.2 Document
- Document type: `Assignment` | `Lab Report` | `Project Report` | `Presentation` | `Term Paper` | *custom string*
- Heading text (auto: `ASSIGNMENT ON`, editable)
- Course title (`Digital System Design Lab`)
- Course code (`CSE-3204`)
- Topic / assignment title (multi-line, `Assignment on Combinational Logic Using Multiplexers, PLA, and PAL`)
- Assignment / experiment number (optional)

### 3.3 Submitted By
- Name (`A. A. M Ashfatul Islam`)
- Student ID (`202411068038`)
- Program (`B.Sc. in CSE`)
- Batch (`68 - Evening`)
- Semester (`Summer 2025`)
- Section / Group (`B`)
- Optional: email, phone
- **Group mode**: add up to 8 members (name + ID) for team submissions — advanced toggle

### 3.4 Submitted To
- Name (`Faria Afrin Niha`)
- Designation (`Lecturer`)
- Department (`Department of CSE`)
- Institution (`Bangladesh University`)
- Optional: email

### 3.5 Dates
- Date of submission (`15/05/2026`), with a "today" shortcut
- Optional: assigned / due date
- Date format: `DD/MM/YYYY` | `MM/DD/YYYY` | `15 May 2026` | `2026-05-15`

---

## 4. Customization (the "geeky" panel)

Collapsed by default behind **Advanced**. Grouped accordions, each with a Reset.

**Template** — 3 layout variants, all A4, all professional:
1. `Classic Bordered` — modernized version of the reference: bold section bands, clean 1px table grid, centered logo. Safest for conservative departments.
2. `Modern Card` (default) — accent side rail, generous whitespace, section labels in small caps, data in a borderless two-column grid. Looks designed, still formal.
3. `Minimal Rule` — typographic, hairline rules only, no boxes, large topic statement. For the design-conscious.

**Theme**
- Accent color (curated swatches + hex input)
- Text color / muted color
- Font pair: Serif document (Lora), Sans document (Inter), Mixed (serif headings + sans body)
- Base font size scale (S / M / L)
- Border style: none / hairline / solid, and corner radius

**Layout**
- Page margin (Narrow / Normal / Wide, or mm value)
- Logo size (mm) + position (center / left / right)
- Section order (drag to reorder: Heading, Course, Submitted By, Submitted To, Date)
- Vertical rhythm / row density (Compact / Normal / Airy)

**Fields**
- Per-field: show / hide, and **rename the label** (e.g. `Section` → `Group`)
- Uppercase / title-case toggles for headings
- Show colon separators (`Course Title  :  ...`) on/off

**Extras**
- Watermark: off / logo / text, with opacity + scale (reference cover uses a faded logo watermark)
- Footer line (e.g. page ownership note)
- Show ruled signature line for the instructor
- Paper size: A4 (default) / Letter

**Settings portability**
- Export settings as JSON, import JSON, and a shareable URL hash (`#s=<base64>`) so a class can share one house style. URL never leaves the browser.

---

## 5. Layout & UX

### 5.1 Desktop (≥ 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: logo · "Assignment Cover"   [Draft: on ▾] [Reset] [Print]│
├────────────────────────────┬─────────────────────────────────────┤
│ LEFT  — Form (scrolls)     │ RIGHT — Live A4 preview (sticky)    │
│  ▸ Institution             │  ┌───────────────────────────────┐  │
│  ▸ Document                │  │                               │  │
│  ▸ Submitted By            │  │      rendered cover page      │  │
│  ▸ Submitted To            │  │        (scaled to fit)        │  │
│  ▸ Dates                   │  │                               │  │
│  ▸ Advanced (collapsed)    │  └───────────────────────────────┘  │
│                            │  Zoom [ – ][ fit ][ + ]  A4 · 210mm │
│                            │  [ Print / Save PDF ]  [ Email ]    │
└────────────────────────────┴─────────────────────────────────────┘
```
- Form is 40% width, preview 60%, preview sticky so it never scrolls away.
- Preview scales with CSS `transform: scale()` against a fixed 210×297mm node — what you see is exactly what prints.
- Every input is controlled and updates state on change; no debounce on preview (cheap re-render), 600 ms debounce only on the draft write.

### 5.2 Mobile (< 1024px)
- Sticky segmented control at top: **Edit | Preview**.
- Floating action button bottom-right toggles to preview and back, so you can check a change without losing your place in the form (this is the "extra preview option so going up and down" requirement).
- A slim **pinned mini-preview strip** at the top of the form (tap to expand full) as a second, always-visible option.
- Preview page scales to viewport width; pinch-zoom and vertical scroll enabled.
- Action bar (Print / Email) docks to the bottom safe area.

### 5.3 Accessibility
- All inputs labelled, `aria-describedby` for hints, visible focus rings, full keyboard path through accordions, `Ctrl/Cmd+P` intercepted to run our print flow, `prefers-reduced-motion` respected, WCAG AA contrast on defaults (accent contrast checked live when a custom hex is entered).

---

## 6. Print & PDF

**Print path (primary, highest quality)**
- A print stylesheet sets `@page { size: A4; margin: 0 }` and hides everything except `#cover-page`.
- `#cover-page` is authored in `mm` units so screen and paper agree.
- `print-color-adjust: exact` so the accent color and watermark survive.
- `Print / Save as PDF` calls `window.print()`; the OS dialog gives both outcomes, so we ship one button labelled clearly.
- Before printing: strip the draft banner, any focus outlines, and the "unsaved" indicator.

**PDF file path (only for email attachment)**
- `html-to-image` snapshots the cover node at `pixelRatio: 3` → PNG → `jspdf` places it full-bleed on an A4 page → `Blob`.
- Filename pattern: `{CourseCode}-{DocumentType}-{StudentID}.pdf`, e.g. `CSE-3204-Assignment-202411068038.pdf`.
- A "Download PDF" secondary button reuses this, for users who want a file without the print dialog. Clearly noted as raster; print is recommended for best quality.

---

## 7. Email

- Dialog collects: recipient email, optional subject and message (both prefilled from env/course data), and shows the attachment name and size.
- Client builds the PDF, POSTs `multipart/form-data` to `POST /api/send`.
- Route handler: Zod-validates, checks size (≤ 5 MB) and MIME, rate-limits by IP (in-memory token bucket, 5/hour — enough for a free personal deploy), sends via Nodemailer SMTP, returns `{ ok }`.
- **Nothing is logged or persisted.** No recipient, no attachment, no body text hits disk or a database. Stated in the UI next to the send button.
- Honeypot field + `Origin` check to keep the endpoint from becoming an open relay.
- If SMTP env vars are absent, the Email button is disabled with a tooltip explaining the deploy needs SMTP configured — the rest of the app still works fully offline.

---

## 8. Local draft

- Toggle in the header: **Save draft locally** (default on, remembered).
- Stores form + settings in `localStorage` under `acg:draft:v1`, debounced 600 ms. Logo data URLs included (with a size cap ~1 MB, else keep the file only in memory for the session).
- A small inline chip near the preview: `Draft saved · 14:22` — `print:hidden`, so it never appears on paper. This satisfies "info only while not printing".
- **Reset on print or mail**: after a successful `window.print()` (via `onafterprint`) or a successful send, the draft is cleared and a toast offers **Undo** for 10 s (one in-memory snapshot) so an accidental wipe is recoverable.
- Turning the toggle off clears storage immediately.
- Explicit `Reset form` in the header, with confirm.

---

## 9. Environment defaults

`.env.example` committed; `.env.local` gitignored. `NEXT_PUBLIC_*` values seed the form on first load so a student — or a whole department — sets their institution once.

```ini
# ---- Institution defaults (public, seed the form) ----
NEXT_PUBLIC_DEFAULT_UNIVERSITY="Bangladesh University"
NEXT_PUBLIC_DEFAULT_DEPARTMENT="Department of CSE"
NEXT_PUBLIC_DEFAULT_LOGO_URL="/logos/bangladesh-university.png"
NEXT_PUBLIC_DEFAULT_PROGRAM="B.Sc. in CSE"
NEXT_PUBLIC_DEFAULT_BATCH="68 - Evening"
NEXT_PUBLIC_DEFAULT_SEMESTER="Summer 2025"
NEXT_PUBLIC_DEFAULT_SECTION="B"
NEXT_PUBLIC_DEFAULT_STUDENT_NAME=""
NEXT_PUBLIC_DEFAULT_STUDENT_ID=""

# ---- Look & feel defaults ----
NEXT_PUBLIC_DEFAULT_TEMPLATE="modern-card"   # classic-bordered | modern-card | minimal-rule
NEXT_PUBLIC_DEFAULT_ACCENT="#B91C1C"
NEXT_PUBLIC_DEFAULT_FONT_PAIR="mixed"        # serif | sans | mixed
NEXT_PUBLIC_DEFAULT_DATE_FORMAT="DD/MM/YYYY"
NEXT_PUBLIC_DEFAULT_PAPER="A4"
NEXT_PUBLIC_DEFAULT_WATERMARK="logo"         # off | logo | text

# ---- Behaviour ----
NEXT_PUBLIC_DRAFT_ENABLED_BY_DEFAULT="true"
NEXT_PUBLIC_RESET_DRAFT_AFTER_OUTPUT="true"
NEXT_PUBLIC_FEATURE_EMAIL="true"

# ---- SMTP (server only, never exposed) ----
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="Assignment Cover <no-reply@example.com>"
MAIL_SUBJECT_TEMPLATE="{courseCode} — {documentType} — {studentName}"
RATE_LIMIT_PER_HOUR="5"
```

A single `src/config/defaults.ts` reads these with typed fallbacks, so the app runs with an empty `.env`.

---

## 10. Project structure

```
assignment-cover/
├─ plan.md
├─ .env.example
├─ public/
│  ├─ logos/                 # bundled default logo(s)
│  └─ fonts/                 # self-hosted woff2
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx            # the whole editor
│  │  ├─ globals.css         # tailwind + @page print rules
│  │  └─ api/send/route.ts   # nodemailer
│  ├─ components/
│  │  ├─ form/               # SectionInstitution, SectionDocument, ... , AdvancedPanel
│  │  ├─ preview/
│  │  │  ├─ CoverPage.tsx    # the printable 210×297mm node
│  │  │  ├─ templates/       # ClassicBordered / ModernCard / MinimalRule
│  │  │  └─ PreviewFrame.tsx # zoom, fit-to-width, mobile scaling
│  │  ├─ ui/                 # Input, Select, Accordion, Dialog, Toast, ColorField, Segmented
│  │  └─ actions/            # PrintButton, EmailDialog, DownloadPdfButton, DraftToggle
│  ├─ lib/
│  │  ├─ store.tsx           # cover state context + reducer
│  │  ├─ useLocalDraft.ts, usePrint.ts
│  │  ├─ pdf.ts              # html-to-image + jspdf
│  │  ├─ merge.ts            # heals untrusted drafts / imports / links
│  │  ├─ cover-model.ts, cover-style.ts
│  │  ├─ date.ts, share.ts, ratelimit.ts
│  │  ├─ schema.ts           # shared types, enums, mm geometry
│  │  └─ mail-schema.ts      # zod payload validation, server-only
│  └─ config/defaults.ts
```

---

## 11. Build order

1. **Scaffold** — Next.js + TS + Tailwind, self-hosted fonts, `defaults.ts`, `.env.example`.
2. **Data layer** — `schema.ts` types, store/reducer, seed from env.
3. **Cover page** — `CoverPage` at true A4 in mm + `ModernCard` template. Get this looking excellent before anything else; it is the product.
4. **Print** — print stylesheet, `@page`, Print button, verify against a real PDF export.
5. **Form** — all sections, controlled inputs, live preview wiring, responsive two-pane shell.
6. **Mobile** — segmented Edit/Preview, FAB, mini-preview strip, docked action bar.
7. **Advanced panel** — theme, layout, field visibility/labels, watermark, other two templates.
8. **Logo upload** — file input, data URL, size validation, remove/restore default.
9. **Draft** — `useLocalDraft`, toggle, saved chip (`print:hidden`), reset-on-output + Undo toast.
10. **PDF + Email** — `pdf.ts`, download button, email dialog, `/api/send`, rate limit, graceful disable when unconfigured.
11. **Polish** — a11y pass, keyboard shortcuts, empty/placeholder states, settings JSON import/export + URL hash, README with SMTP setup for Gmail/Brevo, print-quality verification on Chrome/Firefox.

## 12. Definition of done

- [ ] Reference cover's information reproduced, but visually modern
- [ ] Preview updates on every keystroke, no lag
- [ ] Printed A4 PDF has selectable vector text and correct margins
- [ ] Works fully with JavaScript-only client state, no network calls except optional email
- [ ] Mobile: form and preview both reachable in one tap
- [ ] Draft chip never appears on paper; draft clears after print/mail with undo
- [ ] App boots and is usable with a completely empty `.env`
- [ ] Zero paid dependencies; `npm ls` shows only MIT/Apache/BSD licences
