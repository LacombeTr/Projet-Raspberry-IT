import { lazy, Suspense, useState } from "react";
import type { Coords, HazardStatus, HumidexStatus } from "../api/hazards";
import type { HazardKey } from "../lib/hazardMeta";
import { SEVERITY_LABEL } from "../lib/hazardMeta";
import AlertsPanel from "./AlertsPanel";
import { DropletIcon, FlameIcon, ThermometerIcon, WavesIcon, WindIcon } from "./icons";
import MonitoringPoints from "./MonitoringPoints";
import StatCard from "./StatCard";

// MapLibre GL pulls in a sizeable bundle (~1MB) — code-split it so it's only
// downloaded once the dashboard actually renders, not blocking first paint.
const HazardMap = lazy(() => import("./HazardMap"));

interface Props {
  data: Record<HazardKey, HazardStatus | null>;
  humidex: HumidexStatus | null;
  userCoords: Coords | null;
}

const SEVERITY_TEXT = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

function SeverityValue({ status }: { status: HazardStatus }) {
  return <span className={`text-xl ${SEVERITY_TEXT[status.severity]}`}>{SEVERITY_LABEL[status.severity]}</span>;
}

// Sévérité simple dérivée du seuil de température, distincte de l'indice
// humidex complet (réservé à une StatCard dédiée).
function temperatureSeverity(temp: number | null): "ok" | "warning" | "danger" {
  if (temp === null) return "ok";
  if (temp >= 35) return "danger";
  if (temp >= 30) return "warning";
  return "ok";
}

const TEMPERATURE_DESCRIPTION = {
  ok: "Température normale",
  warning: "Chaleur élevée",
  danger: "Chaleur extrême",
} as const;

const HUMIDEX_SEVERITY_TEXT = {
  ok: "text-emerald-600 dark:text-emerald-400",
  inconfort: "text-amber-500 dark:text-amber-400",
  grand_inconfort: "text-orange-600 dark:text-orange-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

export default function Dashboard({ data, humidex, userCoords }: Props) {
  const [mapExpanded, setMapExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top row: the 5 monitored hazards. 2-up on small screens, 3-up on small tablets, 5-up on wide panels. Fixed height. */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
          label="Feu détecté"
          loading={!data.fire}
          value={data.fire && <SeverityValue status={data.fire} />}
          footer={
            data.fire && <span className="text-slate-600 dark:text-slate-400">{data.fire.description}</span>
          }
        />
        <StatCard
          icon={<ThermometerIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-orange-400 to-orange-500 text-white"
          label="Température mesurée"
          loading={!humidex}
          value={
            humidex &&
            (humidex.temperature !== null ? (
              <>
                {humidex.temperature}
                <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">°C</span>
              </>
            ) : (
              "—"
            ))
          }
          footer={
            humidex &&
            (humidex.temperature !== null ? (
              <span className={SEVERITY_TEXT[temperatureSeverity(humidex.temperature)]}>
                {TEMPERATURE_DESCRIPTION[temperatureSeverity(humidex.temperature)]}
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400">{humidex.description}</span>
            ))
          }
        />
        <StatCard
          icon={<DropletIcon className="size-4" />}
          iconClasses="bg-gradient-to-br from-amber-400 to-amber-500 text-white"
          label="Humidex mesuré"
          loading={!humidex}
          value={humidex && (humidex.humidex !== null ? humidex.humidex : "—")}
          footer={
            humidex && <span className={HUMIDEX_SEVERITY_TEXT[humidex.severity]}>{humidex.description}</span>
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
            <HazardMap
              data={data}
              userCoords={userCoords}
              expanded={mapExpanded}
              onCollapse={() => setMapExpanded(false)}
            />
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
