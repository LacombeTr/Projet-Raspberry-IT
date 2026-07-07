import type { HazardStatus } from "../api/hazards";
import FireCard from "./FireCard";
import FloodCard from "./FloodCard";
import HeatCard from "./HeatCard";
import StatusGauge from "./StatusGauge";
import WindCard from "./WindCard";

interface Props {
  data: {
    wind: HazardStatus | null;
    heat: HazardStatus | null;
    fire: HazardStatus | null;
    flood: HazardStatus | null;
  };
}

const OVERALL_TEXT = {
  ok: {
    title: "Situation normale",
    subtitle: "Tous les indicateurs sont dans les seuils de sécurité.",
  },
  warning: {
    title: "Vigilance requise",
    subtitle: "Un ou plusieurs indicateurs approchent des seuils critiques.",
  },
  danger: {
    title: "Danger actif",
    subtitle: "Au moins un risque majeur est détecté. Consultez les cartes concernées.",
  },
} as const;

function CountChip({ count, label, dot }: { count: number; label: string; dot: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 tabular-nums ${
        count > 0
          ? "bg-slate-900/5 text-slate-600 ring-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"
          : "text-slate-400 ring-slate-900/[0.04] dark:text-slate-600 dark:ring-white/[0.04]"
      }`}
    >
      <span className={`size-2 rounded-full ${dot} ${count > 0 ? "" : "opacity-30"}`} />
      {count} {label}
    </span>
  );
}

export default function Dashboard({ data }: Props) {
  const loaded = [data.wind, data.heat, data.fire, data.flood].filter(
    (d): d is HazardStatus => d !== null
  );
  const counts = { ok: 0, warning: 0, danger: 0 };
  for (const d of loaded) counts[d.severity]++;
  const severity =
    loaded.length === 0 ? null : counts.danger > 0 ? "danger" : counts.warning > 0 ? "warning" : "ok";
  const text = severity ? OVERALL_TEXT[severity] : null;

  return (
    <div className="space-y-5">
      {/* Overall status strip */}
      <section
        aria-live="polite"
        className="group relative isolate flex flex-col items-center gap-5 overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/25 px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.12),0_30px_60px_-20px_rgba(56,189,248,0.45)] backdrop-blur-2xl backdrop-saturate-150 sm:flex-row dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),0_30px_65px_-15px_rgba(56,189,248,0.4)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-16 -left-1/4 w-2/5 rotate-[16deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-500 group-hover:translate-x-6 dark:via-white/10"
        />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30" />
        <StatusGauge severity={severity} />
        <div className="relative min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            Statut système
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {text?.title ?? "Initialisation des capteurs…"}
          </p>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {text?.subtitle ?? "Connexion aux flux de données en cours."}
          </p>
        </div>
        <div className="relative flex flex-wrap items-center justify-center gap-2">
          <CountChip count={counts.ok} label="Normal" dot="bg-emerald-400" />
          <CountChip count={counts.warning} label="Vigilance" dot="bg-amber-400" />
          <CountChip count={counts.danger} label="Danger" dot="bg-red-400" />
        </div>
      </section>

      {/* Hazard cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WindCard data={data.wind} />
        <HeatCard data={data.heat} />
        <FireCard data={data.fire} />
        <FloodCard data={data.flood} />
      </div>
    </div>
  );
}
