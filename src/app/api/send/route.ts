import { NextResponse } from "next/server";

import { clientIp, rateLimit } from "@/lib/ratelimit";
import { MAX_ATTACHMENT_BYTES, sendMailSchema } from "@/lib/mail-schema";

/**
 * The only server-side code in the app.
 *
 * It receives a cover PDF and forwards it once over SMTP. Nothing is written to
 * disk, no database, and no request body — recipient, message or attachment —
 * is logged.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Lets the client know whether the Email button should be enabled. */
export function GET() {
  return NextResponse.json({ configured: smtpConfigured() });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Non-browser callers (curl) send no Origin; treat those as allowed so
  // self-hosted scripting keeps working, and rely on the rate limit instead.
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!smtpConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const limit = Number(process.env.RATE_LIMIT_PER_HOUR ?? "5") || 5;
  const { ok, retryAfter } = rateLimit(clientIp(request.headers), limit);
  if (!ok) {
    return NextResponse.json(
      { error: `Too many emails from this address. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = sendMailSchema.safeParse({
    to: form.get("to") ?? "",
    subject: form.get("subject") ?? "",
    message: form.get("message") ?? "",
    filename: form.get("filename") ?? "",
    nickname: form.get("nickname") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { to, subject, message, filename } = parsed.data;

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attachment missing." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Attachment must be a PDF." }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: "Attachment too large." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? "587") || 587;

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });

    await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: message || `Assignment cover attached: ${filename}`,
      attachments: [{ filename, content: buffer, contentType: "application/pdf" }],
    });

    return NextResponse.json({ ok: true });
  } catch {
    // The SMTP error may contain the credentials or the recipient; never echo it.
    return NextResponse.json(
      { error: "The mail server rejected the message. Check the SMTP settings." },
      { status: 502 },
    );
  }
}
