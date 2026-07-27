import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { HazardStatus } from "../api/hazards";
import { resolveCoordinates } from "../lib/geo";
import { FlameIcon, ThermometerIcon, WavesIcon, WindIcon, XIcon } from "./icons";

type HazardKey = "wind" | "heat" | "fire" | "flood";

interface Props {
  data: Record<HazardKey, HazardStatus | null>;
  expanded?: boolean;
  onCollapse?: () => void;
}

const HAZARDS = [
  { key: "wind", title: "Vents violents", Icon: WindIcon },
  { key: "heat", title: "Vague de chaleur", Icon: ThermometerIcon },
  { key: "fire", title: "Incendies de forêt", Icon: FlameIcon },
  { key: "flood", title: "Inondations", Icon: WavesIcon },
] as const;

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Fallback map center (lng, lat) matching the backend's monitored point
// (config LONGITUDE/LATITUDE) — used until the API's coordinate is available.
const MONITORED_CENTER: [number, number] = [4.85, 45.75];

const FIT_OPTS = { padding: 80, maxZoom: 12 } as const;

// Regional view around the monitored point, used for the map's very first paint
// (before data arrives) so it shows instantly already dezoomed — not zoomed in
// on the location. It closely matches the eventual data-driven fit, so the later
// adjustment is imperceptible.
const DEFAULT_BOUNDS = new maplibregl.LngLatBounds(
  [MONITORED_CENTER[0] - 0.9, MONITORED_CENTER[1] - 0.5],
  [MONITORED_CENTER[0] + 0.9, MONITORED_CENTER[1] + 0.5]
);

const SEVERITY_CHIP = {
  ok: "bg-gradient-to-br from-emerald-400 to-emerald-600 ring-emerald-200",
  warning: "bg-gradient-to-br from-amber-400 to-amber-600 ring-amber-200",
  danger: "bg-gradient-to-br from-red-400 to-red-600 ring-red-200",
} as const;

const SEVERITY_LABEL = { ok: "Normal", warning: "Vigilance", danger: "Danger" } as const;

const SEVERITY_BADGE = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
} as const;

function CountDot({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// Compute the map camera: center on the coordinate the backend provides (the
// fire endpoint's monitored point), and a bounds box symmetric around that
// center so `fitBounds` picks a zoom that includes every displayed point
// without ever shifting the center off the monitored coordinate.
function computeView(
  data: Record<HazardKey, HazardStatus | null>
): { center: [number, number]; bounds: maplibregl.LngLatBounds } {
  const center: [number, number] = data.fire?.location
    ? resolveCoordinates(data.fire.location)
    : MONITORED_CENTER;

  const raw = new maplibregl.LngLatBounds();
  for (const { key } of HAZARDS) {
    const status = data[key];
    if (!status) continue;
    if (key === "fire" && status.fires && status.fires.length > 0) {
      for (const fire of status.fires) raw.extend([fire.longitude, fire.latitude]);
    } else {
      raw.extend(resolveCoordinates(status.location));
    }
  }

  if (raw.isEmpty()) return { center, bounds: new maplibregl.LngLatBounds(center, center) };

  const sw = raw.getSouthWest();
  const ne = raw.getNorthEast();
  const dLng = Math.max(Math.abs(ne.lng - center[0]), Math.abs(center[0] - sw.lng));
  const dLat = Math.max(Math.abs(ne.lat - center[1]), Math.abs(center[1] - sw.lat));
  return {
    center,
    bounds: new maplibregl.LngLatBounds(
      [center[0] - dLng, center[1] - dLat],
      [center[0] + dLng, center[1] + dLat]
    ),
  };
}

export default function HazardMap({ data, expanded = false, onCollapse }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ marker: maplibregl.Marker; root: Root }[]>([]);

  // Create the map immediately so it appears without waiting for the (slow,
  // upstream-bound) hazard data. Its initial camera is the regional default
  // bounds — already dezoomed — so there is no zoom-in-then-jump. The data
  // effect below refines the framing once data lands.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      bounds: DEFAULT_BOUNDS,
      fitBoundsOptions: FIT_OPTS,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      for (const { marker, root } of markersRef.current) {
        marker.remove();
        root.unmount();
      }
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers whenever hazard data changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function render(map: maplibregl.Map) {
      for (const { marker, root } of markersRef.current) {
        marker.remove();
        root.unmount();
      }
      markersRef.current = [];

      for (const { key, title, Icon } of HAZARDS) {
        const status = data[key];
        if (!status) continue;

        // Fire: drop one marker per active NASA FIRMS detection at its real
        // coordinates instead of a single marker at the monitored point.
        if (key === "fire" && status.fires && status.fires.length > 0) {
          for (const fire of status.fires) {
            const el = document.createElement("div");
            const root = createRoot(el);
            root.render(
              <div className="cursor-pointer">
                <div
                  className={`grid size-8 place-items-center rounded-full text-white shadow-lg ring-2 ring-white/80 transition-transform hover:scale-110 ${SEVERITY_CHIP.danger}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            );

            const popupNode = document.createElement("div");
            const popupRoot = createRoot(popupNode);
            popupRoot.render(
              <div className="w-64 bg-white p-4 dark:bg-[#111f36]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${SEVERITY_BADGE.danger}`}
                  >
                    {SEVERITY_LABEL.danger}
                  </span>
                </div>
                <p className="mb-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Feu actif à {fire.distance_km} km du point surveillé
                </p>
                {fire.brightness !== null && (
                  <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                    Brillance : {fire.brightness} K
                  </p>
                )}
                {fire.acquired && (
                  <p className="mb-2 text-[10px] text-slate-400 dark:text-slate-500">
                    Détecté : {fire.acquired} UTC
                  </p>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {fire.latitude.toFixed(3)}, {fire.longitude.toFixed(3)} · {status.source}
                </p>
              </div>
            );

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([fire.longitude, fire.latitude])
              .setPopup(new maplibregl.Popup({ offset: 20, closeButton: false }).setDOMContent(popupNode))
              .addTo(map);

            markersRef.current.push({ marker, root });
          }
          continue;
        }

        const [lng, lat] = resolveCoordinates(status.location);
        const el = document.createElement("div");
        const root = createRoot(el);
        root.render(
          <div className="cursor-pointer">
            <div
              className={`grid size-9 place-items-center rounded-full text-white shadow-lg ring-2 ring-white/80 transition-transform hover:scale-110 ${SEVERITY_CHIP[status.severity]}`}
            >
              <Icon className="size-4" />
            </div>
          </div>
        );

        const popupNode = document.createElement("div");
        const popupRoot = createRoot(popupNode);
        popupRoot.render(
          <div className="w-64 bg-white p-4 dark:bg-[#111f36]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${SEVERITY_BADGE[status.severity]}`}
              >
                {SEVERITY_LABEL[status.severity]}
              </span>
            </div>
            {status.value !== null && (
              <p className="mb-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {status.value} <span className="text-xs font-medium text-slate-400">{status.unit}</span>
              </p>
            )}
            <p className="mb-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {status.description}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {status.location} · {status.source}
            </p>
          </div>
        );

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 20, closeButton: false }).setDOMContent(popupNode))
          .addTo(map);

        markersRef.current.push({ marker, root });
      }

      // Refine the framing once data is available. Before then, leave the
      // regional default bounds the map was created with untouched.
      if (Object.values(data).some(Boolean)) {
        const { bounds } = computeView(data);
        map.fitBounds(bounds, { ...FIT_OPTS, duration: 0 });
      }
    }

    if (map.isStyleLoaded()) render(map);
    else map.once("load", () => render(map));
  }, [data]);

  return (
    <>
      {expanded && (
        <div
          aria-hidden="true"
          onClick={onCollapse}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
        />
      )}
      <section
        className={`group isolate flex h-full min-h-[420px] flex-col overflow-hidden border border-white/60 bg-white/25 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.12),0_30px_60px_-20px_rgba(56,189,248,0.35)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),0_30px_65px_-15px_rgba(56,189,248,0.3)] ${
          expanded ? "fixed inset-4 z-50 rounded-[1.75rem] sm:inset-8" : "relative rounded-[1.75rem]"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-16 -left-1/4 w-2/5 rotate-[16deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-6 dark:via-white/10"
        />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30" />

        <header className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              Cartographie des Risques (Live)
            </p>
            <p className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
              Zones surveillées
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CountDot label="Normal" dot="bg-emerald-500" />
            <CountDot label="Vigilance" dot="bg-amber-500" />
            <CountDot label="Danger" dot="bg-red-500" />
            {expanded && onCollapse && (
              <button
                type="button"
                onClick={onCollapse}
                aria-label="Fermer la carte"
                title="Fermer la carte"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-600 ring-1 ring-slate-900/10 transition-colors hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </header>

        <div
          ref={containerRef}
          className="relative w-full flex-1 overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
        />
      </section>
    </>
  );
}
