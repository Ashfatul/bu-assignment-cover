# Assignment Cover Generator

Build a professional university assignment cover page. Fill the form on the left, watch an A4
page render live on the right, then print it, save it as a PDF, or email it.

Free, no account, no tracking. Everything you type stays in your browser — the only thing that
ever leaves your device is an email you explicitly choose to send.

---

## Quick start

```bash
cp .env.example .env.local     # optional — the app runs fine without it
npm install
npm run dev                    # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

---

## What it does

**Live preview.** The preview is the real page: authored in millimetres at true A4/Letter size and
scaled to fit your screen. Nothing is re-rendered for print, so what you see is what comes out.

**Print / Save as PDF.** The primary output. `window.print()` with a dedicated print stylesheet —
vector text, selectable, correct margins, no rasterisation. In the print dialog choose your printer
or "Save as PDF".

**Download PDF.** A convenience button that rasterises the page (`html-to-image` → `jsPDF`) into a
file, for when you want a file without opening the print dialog. It is image-based, so text isn't
selectable — use Print for anything that matters.

**Email.** Renders the same PDF in your browser and posts it once to `/api/send`, which relays it
over SMTP. The server keeps nothing: no database, no disk writes, no request logging.

**Local draft.** On by default. Your form is saved to `localStorage`, debounced, so a refresh
doesn't lose your work. The "Draft saved" chip never appears on the printed page. After a
successful print or email the draft is cleared, with a 10-second **Undo**.

> Browsers fire `afterprint` whether you printed or cancelled, and give no way to tell which. So
> cancelling the print dialog also clears the draft — that's why Undo exists. Turn the behaviour
> off with `NEXT_PUBLIC_RESET_DRAFT_AFTER_OUTPUT="false"`, or turn drafts off entirely in the
> header.

---

## Templates

| Template | Character |
| --- | --- |
| **Modern Card** (default) | Accent rail, filled title band, borderless data blocks. Designed but formal. |
| **Classic Bordered** | The familiar ruled-table cover, with consistent line weights and real cell padding. |
| **Minimal Rule** | Typographic and quiet. Hairline rules only; the topic is the hero. |

Under **Customise** you can change the accent and text colours, typeface pairing, text size,
border style, corner radius, paper size, margins, spacing, logo size and position, and the order
of the page's sections. Every row can be hidden or relabelled — handy when your department says
"Group" where the default says "Section". Rows with no value hide themselves.

There's also a watermark (logo or text, with opacity and size), an optional footer line, an
optional signature rule, and toggles for colons and heading case.

**Share & backup** exports the whole cover as JSON, imports it back, or copies a *style link* —
a URL whose hash carries only the look and feel, never your name, ID or topic. The hash is parsed
in the browser and is never sent to a server.

---

## Configuration

Everything in `.env.example` is optional. With no `.env.local` at all the app still boots; the
form just starts empty and the Email button is disabled.

### Institution defaults

Set these once and every new cover starts pre-filled — useful if you're deploying this for a whole
department:

```ini
NEXT_PUBLIC_DEFAULT_UNIVERSITY="Bangladesh University"
NEXT_PUBLIC_DEFAULT_DEPARTMENT="Department of CSE"
NEXT_PUBLIC_DEFAULT_LOGO_URL="/logos/default-logo.svg"
NEXT_PUBLIC_DEFAULT_PROGRAM="B.Sc. in CSE"
NEXT_PUBLIC_DEFAULT_BATCH="68 - Evening"
NEXT_PUBLIC_DEFAULT_SEMESTER="Summer 2025"
NEXT_PUBLIC_DEFAULT_SECTION="B"
```

### Your own logo

Two ways:

1. **Bundled** — drop the file in `public/logos/` and point `NEXT_PUBLIC_DEFAULT_LOGO_URL` at it
   (e.g. `/logos/my-university.png`). A square PNG or SVG works best.
2. **Per-user** — click **Upload** in the Institution section. The file is read into a data URL and
   stays in your browser; it is never sent anywhere. Keep it under 1 MB.

The shipped `default-logo.svg` is a neutral placeholder — replace it.

### Email over SMTP

The Email button appears only when the server has SMTP credentials. Any free provider works.

**Gmail** (needs 2-step verification, then an [app password](https://myaccount.google.com/apppasswords)):

```ini
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="you@gmail.com"
SMTP_PASS="xxxxxxxxxxxxxxxx"
MAIL_FROM="Your Name <you@gmail.com>"
```

**Brevo** (300 emails/day free):

```ini
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="<your brevo login>"
SMTP_PASS="<your brevo SMTP key>"
```

Rate limiting defaults to 5 sends per hour per IP (`RATE_LIMIT_PER_HOUR`). The route also rejects
cross-origin posts and carries a honeypot field, so the endpoint can't be used as an open relay.

> Serverless hosts run several instances, each with its own in-memory counter, so the effective
> limit is per-instance. For a personal deploy that's ample; behind a shared domain, put a proper
> limiter in front.

---

## Privacy

- No analytics, no tracking scripts, no third-party requests at runtime.
- Fonts are downloaded at build time by `next/font` and served from your own origin — the browser
  never contacts Google.
- The cover, your logo and your draft live in `localStorage` on your device only.
- `/api/send` is the only server code. It reads the request, sends one email, and returns. Nothing
  is written to disk or a database, and SMTP errors are never echoed back (they can contain
  credentials).
- The style link's data lives in the URL *hash*, which browsers do not transmit to servers.

---

## Deploying

**Vercel (free tier).** Import the repo, add the `SMTP_*` and `NEXT_PUBLIC_*` variables in project
settings, deploy.

**Any VPS / Docker.**

```bash
npm ci && npm run build && npm start   # listens on :3000
```

**Fully static.** If you don't need email, set `NEXT_PUBLIC_FEATURE_EMAIL="false"`, add
`output: "export"` to `next.config.ts`, delete `src/app/api/`, and `npm run build` produces a
folder you can host anywhere.

---

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · lucide-react · `html-to-image` + `jsPDF`
(lazy-loaded, PDF file path only) · Nodemailer · Zod.

No paid services and no paid packages. UI widgets are hand-rolled on native elements — `<select>`,
`<dialog>`, `<input type="color">` — rather than pulling in a component library.

---

## Project layout

```
src/
├─ app/
│  ├─ page.tsx            entry
│  ├─ globals.css         Tailwind + the print stylesheet
│  └─ api/send/route.ts   the only server code
├─ components/
│  ├─ Editor.tsx          two-pane shell, mobile switch, draft wiring
│  ├─ form/               input sections + the Customise panel
│  ├─ preview/            CoverPage, PreviewFrame, templates/
│  ├─ actions/            print / PDF / email
│  └─ ui/                 inputs, dialog, toasts
├─ lib/
│  ├─ schema.ts           types, enums and mm geometry constants
│  ├─ mail-schema.ts      Zod validation for the email payload (server only)
│  ├─ merge.ts            heals untrusted drafts, imports and links
│  ├─ cover-model.ts      state → the rows a template renders
│  ├─ cover-style.ts      mm geometry and CSS custom properties
│  ├─ store.tsx, useLocalDraft.ts, usePrint.ts
│  └─ pdf.ts, share.ts, date.ts, ratelimit.ts
└─ config/defaults.ts     env parsing, with fallbacks for everything
```

## Keyboard

`Ctrl`/`Cmd` + `P` — print the cover (not the web page).
