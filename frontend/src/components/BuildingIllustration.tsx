const BACK_WINDOWS = [56, 70, 84, 98, 112, 126, 140].flatMap((y) =>
  [12, 26, 40].map((x) => ({ x, y }))
);

const FRONT_WINDOWS = [30, 44, 58, 72, 86, 100].flatMap((y) =>
  [58, 74, 90, 106, 122].map((x) => ({ x, y }))
);

/** Decorative skyline emblem: a monitored building sending out a live sensor signal. */
export default function BuildingIllustration() {
  return (
    <svg
      viewBox="0 0 140 160"
      className="h-full w-full drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]"
      role="img"
      aria-label="Illustration d'un bâtiment surveillé"
    >
      <defs>
        <linearGradient id="towerBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" className="text-sky-200 dark:text-sky-900/70" />
          <stop offset="100%" stopColor="currentColor" className="text-sky-300 dark:text-sky-950/70" />
        </linearGradient>
        <linearGradient id="towerFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" className="text-sky-400 dark:text-sky-500/50" />
          <stop offset="100%" stopColor="currentColor" className="text-sky-600 dark:text-sky-700/50" />
        </linearGradient>
      </defs>

      {/* back tower */}
      <rect x="4" y="46" width="46" height="108" rx="4" fill="url(#towerBack)" />
      {BACK_WINDOWS.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width="7" height="7" rx="1.5" className="fill-white/70 dark:fill-white/10" />
      ))}

      {/* front tower */}
      <rect x="42" y="20" width="94" height="134" rx="6" fill="url(#towerFront)" />
      {FRONT_WINDOWS.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width="9" height="9" rx="1.5" className="fill-white/85 dark:fill-white/15" />
      ))}
      <rect x="84" y="124" width="28" height="30" rx="2" className="fill-white/50 dark:fill-white/10" />

      {/* rooftop sensor signal */}
      <path
        d="M104 12a16 16 0 0 1 0 22.6"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-sky-500 dark:stroke-sky-400"
      />
      <path
        d="M99 17a9 9 0 0 1 0 12.6"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-sky-500 dark:stroke-sky-400"
      />
      <circle cx="94" cy="23" r="3.5" className="fill-sky-500 dark:fill-sky-400" />
    </svg>
  );
}
