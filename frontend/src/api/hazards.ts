export interface HazardStatus {
  hazard: string;
  severity: "ok" | "warning" | "danger";
  value: number | null;
  unit: string | null;
  location: string | null;
  description: string;
  source: string;
  last_updated: string;
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
