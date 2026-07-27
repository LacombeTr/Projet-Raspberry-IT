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

async function fetchHazard(path: string): Promise<HazardStatus> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

export const getWind = () => fetchHazard("/wind/");
export const getHeat = () => fetchHazard("/heat/");
export const getFire = () => fetchHazard("/fire/");
export const getFlood = () => fetchHazard("/flood/");
