import type { HazardStatus } from "../api/hazards";
import { CircleCheckIcon, TriangleAlertIcon } from "./icons";
import type { HazardKey } from "../lib/hazardMeta";
import { listActiveHazards } from "../lib/hazardMeta";

interface Props {
  data: Record<HazardKey, HazardStatus | null>;
}

function timeAgo(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const minutes = Math.max(0, Math.round((Date.now() - d.getTime()) / 60_000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `il y a ${hours} h`;
}

export default function AlertsPanel({ data }: Props) {
  const alerts = listActiveHazards(data).filter((entry) => entry.status.severity !== "ok");

  const isCalm = alerts.length === 0;

  return (
    <section
      className={`group relative isolate flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.1)] backdrop-blur-2xl backdrop-saturate-150 ${
        isCalm
          ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]"
          : "border-red-200/70 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/[0.06]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/20" />

      <header className="relative mb-4 flex items-center gap-2">
        {isCalm ? (
          <CircleCheckIcon className="size-5 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <TriangleAlertIcon className="size-5 text-red-500 dark:text-red-400" />
        )}
        <h2
          className={`text-base font-bold ${
            isCalm ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
          }`}
        >
          {isCalm ? "Aucune alerte active" : "Alertes Actives"}
        </h2>
      </header>

      {isCalm ? (
        <p className="relative text-sm leading-relaxed text-emerald-800/70 dark:text-emerald-200/70">
          Tous les capteurs surveillés sont dans les seuils de sécurité.
        </p>
      ) : (
        <ul className="relative flex-1 space-y-3 overflow-y-auto">
          {alerts.map(({ key, title, status }) => {
            const ago = timeAgo(status.last_updated);
            const danger = status.severity === "danger";
            return (
              <li
                key={key}
                className={`rounded-2xl border p-3.5 ${
                  danger
                    ? "border-red-200/70 bg-white/50 dark:border-red-500/20 dark:bg-white/5"
                    : "border-amber-200/70 bg-white/50 dark:border-amber-500/20 dark:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 size-2 shrink-0 rounded-full ${danger ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {status.description}
                    </p>
                    {status.location && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{status.location}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                          danger ? "bg-red-500" : "bg-amber-500"
                        }`}
                      >
                        {danger ? "Intervention Requise" : "Vigilance"}
                      </span>
                      {ago && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{ago}</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
