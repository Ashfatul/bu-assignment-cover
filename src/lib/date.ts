import type { DateFormat } from "@/lib/schema";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Formats an ISO `YYYY-MM-DD` string without going through `Date`, so the
 * result never shifts by a day due to the viewer's timezone.
 */
export function formatDate(iso: string, format: DateFormat): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return "";

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "";

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "D MMMM YYYY":
      return `${Number(day)} ${MONTHS[monthIndex]} ${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
  }
}

/** Today in the viewer's local timezone, as `YYYY-MM-DD`. */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
