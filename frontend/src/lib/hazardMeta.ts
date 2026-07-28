import { FlameIcon, ThermometerIcon, WavesIcon, WindIcon } from "../components/icons";
import type { FirePoint, HazardStatus, HumidexStatus } from "../api/hazards";

export type HazardKey = "wind" | "heat" | "fire" | "flood";

export type Severity = "ok" | "warning" | "danger";

/** A fire detection's place as "Commune (XX)", or just the commune, or null. */
export function firePointPlace(fire: FirePoint): string | null {
  if (!fire.commune) return null;
  return fire.department ? `${fire.commune} (${fire.department})` : fire.commune;
}

/** Concise summary of the distinct communes touched by a fire hazard's detections. */
export function fireCommunesLabel(status: HazardStatus): string | null {
  const places = new Set<string>();
  for (const fire of status.fires ?? []) {
    const place = firePointPlace(fire);
    if (place) places.add(place);
  }
  if (places.size === 0) return null;
  const list = [...places];
  return list.length <= 2 ? list.join(", ") : `${list.slice(0, 2).join(", ")} +${list.length - 2}`;
}

export const HAZARD_META = [
  { key: "wind", title: "Vents violents", Icon: WindIcon },
  { key: "heat", title: "Vague de chaleur", Icon: ThermometerIcon },
  { key: "fire", title: "Feu détecté", Icon: FlameIcon },
  { key: "flood", title: "Inondations", Icon: WavesIcon },
] as const satisfies readonly { key: HazardKey; title: string; Icon: typeof WindIcon }[];

export const SEVERITY_LABEL = { ok: "Normal", warning: "Vigilance", danger: "Danger" } as const;

export interface HazardEntry {
  key: HazardKey;
  title: string;
  Icon: typeof WindIcon;
  status: HazardStatus;
}

export function listActiveHazards(data: Record<HazardKey, HazardStatus | null>): HazardEntry[] {
  const rank = { danger: 0, warning: 1, ok: 2 } as const;
  const entries: HazardEntry[] = [];
  for (const { key, title, Icon } of HAZARD_META) {
    const status = data[key];
    if (status) entries.push({ key, title, Icon, status });
  }
  return entries.sort((a, b) => rank[a.status.severity] - rank[b.status.severity]);
}

/** Sévérité à 3 paliers pour le point de surveillance Humidex, alignée sur les
autres aléas — distincte de `HumidexStatus.severity` (5 paliers) utilisée
par la StatCard Humidex dédiée.**/
export function humidexPointSeverity(value: number | null): Severity {
  if (value === null) return "ok";
  if (value >= 54) return "danger";
  if (value >= 45) return "warning";
  return "ok";
}

/** Pire sévérité parmi les 4 aléas et l'humidex — utilisée pour piloter la LED de statut. */
export function overallSeverity(
  data: Record<HazardKey, HazardStatus | null>,
  humidex: HumidexStatus | null
): Severity {
  const severities = listActiveHazards(data).map((e) => e.status.severity);
  if (humidex) severities.push(humidexPointSeverity(humidex.humidex));
  if (severities.includes("danger")) return "danger";
  if (severities.includes("warning")) return "warning";
  return "ok";
}
