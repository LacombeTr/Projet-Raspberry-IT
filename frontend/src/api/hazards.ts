export interface FirePoint {
  latitude: number;
  longitude: number;
  distance_km: number;
  brightness: number | null;
  acquired: string | null;
}

export interface HazardStatus {
  hazard: string;
  severity: "ok" | "warning" | "danger";
  value: number | null;
  unit: string | null;
  location: string | null;
  description: string;
  source: string;
  last_updated: string;
  fires?: FirePoint[] | null; // only present on the fire hazard
}

export interface HumidexStatus {
  temperature: number | null;
  humidity: number | null;
  humidex: number | null;
  severity: "ok" | "inconfort" | "grand_inconfort" | "warning" | "danger";
  description: string;
  source: string;
  last_updated: string;
}

async function fetchJson<DataHazard>(path: string): Promise<DataHazard> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

export const getWind = () => fetchJson<HazardStatus>("/wind/");
export const getHeat = () => fetchJson<HazardStatus>("/heat/");
export const getFire = () => fetchJson<HazardStatus>("/fire/");
export const getFlood = () => fetchJson<HazardStatus>("/flood/");
export const getHumidex = () => fetchJson<HumidexStatus>("/humidex/");
