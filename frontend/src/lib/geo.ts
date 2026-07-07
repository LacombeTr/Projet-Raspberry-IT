/**
 * The `HazardStatus` API contract only carries a human-readable `location`
 * string (e.g. "Marseille, FR") — no coordinates. Since the backend mock data
 * only ever returns a small fixed set of French place names, we resolve them
 * to map coordinates on the client rather than touching the API contract.
 *
 * If the backend starts returning a place name that isn't in this table, the
 * map simply falls back to a default point over Provence (where all the
 * current mock hazards are located) so it never crashes or silently drops a
 * marker.
 */
const KNOWN_LOCATIONS: Record<string, [lng: number, lat: number]> = {
  "Marseille, FR": [5.3698, 43.2965],
  "Var, FR": [6.1724, 43.5453],
  "Bassin du Rhône": [4.628, 43.6769], // Arles — real Rhône-delta town, keeps markers clustered near Provence
};

const DEFAULT_COORDS: [lng: number, lat: number] = [5.5, 43.7]; // Provence, FR

export function resolveCoordinates(location: string | null): [lng: number, lat: number] {
  if (location && location in KNOWN_LOCATIONS) return KNOWN_LOCATIONS[location];
  return DEFAULT_COORDS;
}
