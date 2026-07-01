/**
 * Sawafuji brandmarks.
 * - <LogoFull> renders the full SAWAFUJI wordmark image (has the name in it),
 *   for the login panel and the expanded sidebar header.
 * - <LogoMark> is a compact "S" monogram badge in the brand blue, for tight
 *   icon-only spots such as the collapsed sidebar rail.
 */

const BRAND_BLUE = "#1C50C8";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
        background: BRAND_BLUE,
      }}
      aria-hidden
    >
      S
    </span>
  );
}

export function LogoFull({ height = 30, className = "" }: { height?: number; className?: string }) {
  // The wordmark art has a white background, so it sits in a white rounded chip
  // to read cleanly on both the dark sidebar and light surfaces.
  return (
    <span
      className={`inline-flex items-center rounded-md bg-white px-2 py-1 ${className}`}
      style={{ lineHeight: 0 }}
    >
      <img
        src="/full-logo.jpeg"
        alt="Sawafuji"
        style={{ height }}
        className="w-auto object-contain"
      />
    </span>
  );
}
