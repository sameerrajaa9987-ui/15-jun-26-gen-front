/**
 * PowerGen brandmark — a power/lightning bolt over a generator unit in a
 * graphite badge, in the Voltage palette (graphite + electric amber).
 * The mark stays the same in light/dark mode because it lives in the sidebar,
 * which is always graphite.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="12" fill="#0C1118" />
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="63"
        rx="11.5"
        fill="none"
        stroke="#F5A623"
        strokeOpacity="0.45"
      />
      {/* Generator body */}
      <g fill="#1E2836" stroke="#F5A623" strokeWidth="1.5">
        <rect x="12" y="34" width="40" height="16" rx="3" />
      </g>
      {/* Control panel + exhaust */}
      <g fill="#F5A623">
        <rect x="16" y="38" width="8" height="5" rx="1" />
        <circle cx="44" cy="42" r="3" />
        <rect x="46" y="28" width="4" height="7" rx="1" />
      </g>
      {/* Electric bolt */}
      <path
        d="M34 10 L22 32 L31 32 L28 50 L44 26 L34 26 Z"
        fill="#F5A623"
        stroke="#0C1118"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Base line */}
      <line x1="10" y1="54" x2="54" y2="54" stroke="#F5A623" strokeWidth="1" opacity="0.55" />
    </svg>
  );
}
