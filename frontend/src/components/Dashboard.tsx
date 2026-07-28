import { lazy, Suspense } from "react";
import type { HazardStatus } from "../api/hazards";
import type { HazardKey } from "../lib/hazardMeta";
import { SEVERITY_LABEL } from "../lib/hazardMeta";
import AlertsPanel from "./AlertsPanel";
import { FlameIcon, ThermometerIcon, WavesIcon, WindIcon } from "./icons";
import MonitoringPoints from "./MonitoringPoints";
import StatCard from "./StatCard";

// MapLibre GL pulls in a sizeable bundle (~1MB) — code-split it so it's only
// downloaded once the dashboard actually renders, not blocking first paint.
const HazardMap = lazy(() => import("./HazardMap"));

interface Props {
  data: Record<HazardKey, HazardStatus | null>;
}

const SEVERITY_TEXT = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

function SeverityValue({ status }: { status: HazardStatus }) {
  return <span className={`text-xl ${SEVERITY_TEXT[status.severity]}`}>{SEVERITY_LABEL[status.severity]}</span>;
}

export default function Dashboard({ data }: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top row: the 4 monitored hazards. 2-up on small screens, 4-up on tablet/panel widths. Fixed height. */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<WindIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-sky-400 to-sky-500 text-white"
          label="Vent / Rafales"
          loading={!data.wind}
          value={
            data.wind && (
              <>
                {data.wind.value}
                <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {data.wind.unit}
                </span>
              </>
            )
          }
          footer={
            data.wind && <span className={SEVERITY_TEXT[data.wind.severity]}>{data.wind.description}</span>
          }
        />
        <StatCard
          icon={<WavesIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-indigo-400 to-indigo-500 text-white"
          label="Inondations"
          loading={!data.flood}
          value={data.flood && <SeverityValue status={data.flood} />}
          footer={
            data.flood && <span className="text-slate-600 dark:text-slate-400">{data.flood.description}</span>
          }
        />
        <StatCard
          icon={<FlameIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-red-400 to-red-500 text-white"
          label="Incendies de forêt"
          loading={!data.fire}
          value={data.fire && <SeverityValue status={data.fire} />}
          footer={
            data.fire && <span className="text-slate-600 dark:text-slate-400">{data.fire.description}</span>
          }
        />
        <StatCard
          icon={<ThermometerIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-orange-400 to-orange-500 text-white"
          label="Température"
          loading={!data.heat}
          value={
            data.heat && (
              <>
                {data.heat.value}
                <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {data.heat.unit}
                </span>
              </>
            )
          }
          footer={
            data.heat && <span className={SEVERITY_TEXT[data.heat.severity]}>{data.heat.description}</span>
          }
        />
      </div>

      {/* Map on the left half, alerts and monitoring points on the right half. Fills remaining height. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="min-h-0">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-white/60 bg-white/25 text-sm text-slate-500 backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.07] dark:text-slate-400">
                Chargement de la carte…
              </div>
            }
          >
            <HazardMap data={data} />
          </Suspense>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <AlertsPanel data={data} />
          <MonitoringPoints data={data} />
        </div>
      </div>
    </div>
  );
}
