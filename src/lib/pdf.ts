import { PAPER_SIZE_MM, type Paper } from "@/lib/schema";

/**
 * Rasterises the cover node and wraps it in a single-page PDF.
 *
 * This path exists only because an email needs a *file*. For a document the
 * user keeps, the print dialog is better: it produces vector, selectable text.
 * Both libraries are loaded lazily so they never touch the initial bundle.
 */
export async function coverToPdfBlob(node: HTMLElement, paper: Paper): Promise<Blob> {
  const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);

  const size = PAPER_SIZE_MM[paper];

  const dataUrl = await toPng(node, {
    // 3× gives ~230 dpi at A4 — crisp on screen and in print, still a few hundred KB.
    pixelRatio: 3,
    backgroundColor: "#ffffff",
    // The node lives inside a scaled container; pin the intrinsic size so the
    // capture is never taken at the preview's zoom level.
    width: node.offsetWidth,
    height: node.offsetHeight,
    style: { transform: "none", margin: "0", boxShadow: "none" },
    // Fonts are same-origin (next/font), so nothing external needs embedding.
    skipFonts: false,
    cacheBust: false,
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: [size.width, size.height],
    orientation: size.width > size.height ? "landscape" : "portrait",
    compress: true,
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, size.width, size.height, undefined, "FAST");
  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
