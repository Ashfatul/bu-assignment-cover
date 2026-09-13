import type { CoverSettings } from "@/lib/schema";

/**
 * Faded logo or text behind the content, like the reference cover. Sits in the
 * page's padding box but ignores it, so it can span the full sheet.
 */
export function Watermark({
  settings,
  logo,
  fallbackText,
}: {
  settings: CoverSettings;
  logo: string;
  fallbackText: string;
}) {
  const { watermark, watermarkOpacity, watermarkScale, watermarkText } = settings.extras;
  if (watermark === "off") return null;

  const text = (watermarkText || fallbackText).trim();
  if (watermark === "logo" && !logo) return null;
  if (watermark === "text" && !text) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: watermarkOpacity,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {watermark === "logo" ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs and print fidelity
        <img
          src={logo}
          alt=""
          style={{
            width: `calc(var(--page-w) * ${watermarkScale})`,
            maxHeight: `calc(var(--page-h) * 0.7)`,
            objectFit: "contain",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: `calc(var(--page-w) * ${watermarkScale * 0.13})`,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textAlign: "center",
            lineHeight: 1.1,
            color: "var(--accent)",
            transform: "rotate(-24deg)",
            maxWidth: "90%",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
