type OverallSeverity = "ok" | "warning" | "danger";

const GAUGE: Record<OverallSeverity, { label: string; stroke: string; percent: number; glow: string }> = {
  ok: { label: "Normal", stroke: "#34d399", percent: 22, glow: "bg-emerald-400/40" },
  warning: { label: "Vigilance", stroke: "#fbbf24", percent: 60, glow: "bg-amber-400/40" },
  danger: { label: "Danger", stroke: "#f87171", percent: 92, glow: "bg-red-400/40" },
};

const R = 46;
const CX = 60;
const CY = 58;
const CIRCUMFERENCE = Math.PI * R;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/** Semi-circle risk-level gauge used in the overall system status strip. */
export default function StatusGauge({ severity }: { severity: OverallSeverity | null }) {
  const cfg = severity ? GAUGE[severity] : null;
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * (cfg?.percent ?? 0)) / 100;

  return (
    <div className="relative flex w-40 shrink-0 flex-col items-center sm:w-44">
      {cfg && (
        <div
          className={`pointer-events-none absolute inset-x-4 top-2 h-16 rounded-full blur-2xl transition-colors duration-700 ${cfg.glow}`}
        />
      )}
      <svg viewBox="0 0 120 66" className="relative w-full" role="img" aria-label={cfg ? `Niveau de risque global : ${cfg.label}` : "Chargement du statut"}>
        <path
          d={ARC}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-slate-200 dark:stroke-white/[0.08]"
        />
        <path
          d={ARC}
          fill="none"
          stroke={cfg?.stroke ?? "#334155"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
        />
      </svg>
      <p className="-mt-6 text-center text-base font-extrabold uppercase tracking-wide text-slate-900 sm:text-lg dark:text-white">
        {cfg?.label ?? "—"}
      </p>
    </div>
  );
}
