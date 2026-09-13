import { z } from "zod";

/**
 * Validation for the email route's payload. Kept in its own module so `zod`
 * stays out of the client bundle — `schema.ts` is imported by client
 * components, this file is only imported by the route handler.
 */
export const sendMailSchema = z.object({
  to: z.string().trim().email("Enter a valid email address").max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().max(4000).optional().default(""),
  filename: z
    .string()
    .trim()
    .min(1)
    .max(120)
    // Keep it a plain filename: no path separators, no traversal.
    .regex(/^[A-Za-z0-9._-]+\.pdf$/, "Invalid filename"),
  /** Anti-bot honeypot: must arrive empty. */
  nickname: z.string().max(0).optional().default(""),
});

export type SendMailInput = z.infer<typeof sendMailSchema>;

/** Refuse anything larger; a cover page renders well under 1 MB. */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
