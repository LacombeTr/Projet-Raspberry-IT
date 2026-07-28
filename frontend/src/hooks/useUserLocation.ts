import { useCallback, useEffect, useState } from "react";
import type { Coords } from "../api/hazards";

const STORAGE_KEY = "hazard-monitor:coords";

export type LocationStatus = "idle" | "locating" | "granted" | "denied" | "unsupported";

function readStored(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lon === "number") return parsed;
  } catch {
    // corrupt/absent — ignore and fall back to the backend default
  }
  return null;
}

/**
 * Owns the user's GPS position. `coords === null` means "no position yet" — the
 * app then omits lat/lon from API calls and the backend uses its configured
 * default point. The last granted position is persisted so reloads don't
 * re-prompt. Requires a secure context (localhost counts) for the browser to
 * expose `navigator.geolocation`.
 */
export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(readStored);
  const [status, setStatus] = useState<LocationStatus>(readStored() ? "granted" : "idle");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: Coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(next);
        setStatus("granted");
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // storage may be unavailable (private mode) — position still works this session
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }, []);

  // Attempt to locate once on first mount so the app follows the user without a
  // manual click when permission is already granted. If it was never granted,
  // the browser prompts; a denial just leaves us on the default point.
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { coords, status, requestLocation };
}
