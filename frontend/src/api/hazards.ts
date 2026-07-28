export interface FirePoint {
  latitude: number;
  longitude: number;
  distance_km: number;
  brightness: number | null;
  acquired: string | null;
  commune: string | null;
  department: string | null;
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

export interface Coords {
  lat: number;
  lon: number;
}

async function fetchHazard(path: string, coords?: Coords | null): Promise<HazardStatus> {
  const qs = coords ? `?lat=${coords.lat}&lon=${coords.lon}` : "";
  const res = await fetch(`/api${path}${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

async function fetchJson<DataHazard>(path: string): Promise<DataHazard> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

export const getWind = (coords?: Coords | null) => fetchHazard("/wind/", coords);
export const getHeat = (coords?: Coords | null) => fetchHazard("/heat/", coords);
export const getFire = (coords?: Coords | null) => fetchHazard("/fire/", coords);
export const getFlood = (coords?: Coords | null) => fetchHazard("/flood/", coords);
export const getHumidex = () => fetchJson<HumidexStatus>("/humidex/");
