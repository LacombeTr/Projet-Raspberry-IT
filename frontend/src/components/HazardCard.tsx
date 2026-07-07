import type { ReactNode } from "react";
import type { HazardStatus } from "../api/hazards";
import { ClockIcon, MapPinIcon } from "./icons";

const SEVERITY = {
  ok: {
    label: "Normal",
    iconChip: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40",
    badge: "bg-emerald-500 text-white ring-1 ring-white/50",
    dot: "bg-white",
    glow:
      "shadow-[0_10px_30px_rgba(15,23,42,0.12),0_30px_60px_-20px_rgba(16,185,129,0.5)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.14),0_35px_70px_-15px_rgba(16,185,129,0.65)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),0_30px_65px_-15px_rgba(16,185,129,0.65)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_35px_75px_-12px_rgba(16,185,129,0.8)]",
  },
  warning: {
    label: "Vigilance",
    iconChip: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/40",
    badge: "bg-amber-500 text-white ring-1 ring-white/50",
    dot: "bg-white",
    glow:
      "shadow-[0_10px_30px_rgba(15,23,42,0.12),0_30px_60px_-20px_rgba(245,158,11,0.5)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.14),0_35px_70px_-15px_rgba(245,158,11,0.65)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),0_30px_65px_-15px_rgba(245,158,11,0.65)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_35px_75px_-12px_rgba(245,158,11,0.8)]",
  },
  danger: {
    label: "Danger",
    iconChip: "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/40",
    badge: "bg-red-500 text-white ring-1 ring-white/50",
    dot: "bg-white",
    glow:
      "shadow-[0_10px_30px_rgba(15,23,42,0.12),0_30px_60px_-20px_rgba(239,68,68,0.55)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.14),0_35px_70px_-15px_rgba(239,68,68,0.7)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),0_30px_65px_-15px_rgba(239,68,68,0.75)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_35px_75px_-12px_rgba(239,68,68,0.9)]",
  },
} as const;

function formatTime(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  icon: ReactNode;
  title: string;
  data: HazardStatus | null;
  /** Big numeric readout, rendered above the uppercase caption (wind speed, temperature…). */
  value?: ReactNode;
  /** Secondary body copy, rendered below the caption. */
  children?: ReactNode;
}

export default function HazardCard({ icon, title, data, value, children }: Props) {
  const s = data ? SEVERITY[data.severity] : null;
  const time = data ? formatTime(data.last_updated) : null;

  return (
    <article
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/25 p-5 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 hover:border-white/80 dark:border-white/15 dark:bg-white/[0.07] dark:hover:border-white/25 ${
        s ? s.glow : "shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      }`}
    >
      {/* Glass reflection streak */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-10 -left-1/4 w-2/5 rotate-[16deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-500 group-hover:translate-x-6 dark:via-white/10"
      />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30" />

      <header className="relative mb-4 flex items-center justify-between">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-lg ${
            s?.iconChip ?? "bg-slate-900/5 text-slate-500 ring-1 ring-slate-900/10 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10"
          }`}
        >
          {icon}
        </div>
        {s ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${s.badge}`}
          >
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        ) : (
          <span className="h-5 w-16 animate-pulse rounded-full bg-slate-900/5 dark:bg-white/10" />
        )}
      </header>

      {!data ? (
        <div role="status" aria-label="Chargement des données" className="relative flex-1 animate-pulse space-y-3">
          <div className="h-8 w-24 rounded-lg bg-slate-900/5 dark:bg-white/10" />
          <div className="h-2.5 w-20 rounded bg-slate-900/5 dark:bg-white/10" />
          <div className="space-y-2 pt-1">
            <div className="h-2.5 w-full rounded bg-slate-900/5 dark:bg-white/10" />
            <div className="h-2.5 w-2/3 rounded bg-slate-900/5 dark:bg-white/10" />
          </div>
        </div>
      ) : (
        <div className="relative flex-1">
          {value && <div className="mb-1">{value}</div>}
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{title}</p>
          {children && <div className="mt-2">{children}</div>}
          {data.location && (
            <p className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/40 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-white/60 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
              <MapPinIcon className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
              <span className="truncate">{data.location}</span>
            </p>
          )}
        </div>
      )}

      <footer className="relative mt-4 flex items-center justify-between gap-3 border-t border-white/40 pt-3 dark:border-white/10">
        {data ? (
          <>
            <span className="truncate text-[11px] text-slate-600 dark:text-slate-400" title={`Source : ${data.source}`}>
              {data.source}
            </span>
            {time && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-slate-600 dark:text-slate-400">
                <ClockIcon className="size-3" />
                {time}
              </span>
            )}
          </>
        ) : (
          <span className="h-2.5 w-24 animate-pulse rounded bg-slate-900/5 dark:bg-white/10" />
        )}
      </footer>
    </article>
  );
}

/** Large numeric readout for value-based hazards (wind speed, temperature…). */
export function HazardValue({ value, unit }: { value: number | null; unit: string | null }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums drop-shadow-sm sm:text-4xl dark:text-white">
        {value ?? "—"}
      </span>
      {unit && <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{unit}</span>}
    </p>
  );
}

/** Body copy shared by every card. */
export function HazardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">{children}</p>;
}
