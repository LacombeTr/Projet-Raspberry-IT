import { FlameIcon, ThermometerIcon, WavesIcon, WindIcon } from "../components/icons";
import type { HazardStatus } from "../api/hazards";

export type HazardKey = "wind" | "heat" | "fire" | "flood";

export const HAZARD_META = [
  { key: "wind", title: "Vents violents", Icon: WindIcon },
  { key: "heat", title: "Vague de chaleur", Icon: ThermometerIcon },
  { key: "fire", title: "Incendies de forêt", Icon: FlameIcon },
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
