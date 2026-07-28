import type { HazardStatus } from "../api/hazards";
import type { HazardKey } from "../lib/hazardMeta";
import { fireCommunesLabel, listActiveHazards, SEVERITY_LABEL } from "../lib/hazardMeta";

interface Props {
  data: Record<HazardKey, HazardStatus | null>;
}

const SEVERITY_CHIP = {
  ok: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  warning: "bg-gradient-to-br from-amber-400 to-amber-600",
  danger: "bg-gradient-to-br from-red-400 to-red-600",
} as const;

const SEVERITY_DOT = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
} as const;

export default function MonitoringPoints({ data }: Props) {
  const entries = listActiveHazards(data);
  const normalCount = entries.filter((e) => e.status.severity === "ok").length;

  return (
    <section className="group relative isolate overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/25 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.1)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/20" />

      <header className="relative mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Points de Surveillance</h2>
        <span className="inline-flex shrink-0 items-center rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-900/10 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
          {normalCount}/{entries.length || 4} normaux
        </span>
      </header>

      {entries.length === 0 ? (
        <div className="relative space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-900/5 dark:bg-white/10" />
          ))}
        </div>
      ) : (
        <ul className="relative space-y-2">
          {entries.map(({ key, title, Icon, status }) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-2xl bg-white/40 p-2.5 ring-1 ring-white/60 dark:bg-white/5 dark:ring-white/10"
            >
              <div
                className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${SEVERITY_CHIP[status.severity]}`}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {(key === "fire" && fireCommunesLabel(status)) || status.location || status.source}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className={`size-2 rounded-full ${SEVERITY_DOT[status.severity]}`} />
                {SEVERITY_LABEL[status.severity]}
              </span>
            </li>
          ))}
        </ul>
      )}
      </section>
  );
}
