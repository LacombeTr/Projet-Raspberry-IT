"""
Coordinate handling shared across the hazard routers.

The monitored point is no longer a single fixed env value: each request may
carry `lat`/`lon` query parameters (the user's GPS position). When they are
absent we fall back to the configured `settings.LATITUDE`/`LONGITUDE`.

The flood hazard is driven by a Vigicrues station code + a department number
rather than raw coordinates, so this module also derives both from a
coordinate using keyless French public APIs — degrading gracefully to the
configured defaults if a lookup fails.
"""
import math
import re
import time
from dataclasses import dataclass

import httpx
from fastapi import Query

from config import settings

# geo.api.gouv.fr — reverse-lookup the commune (and its department) at a point.
GEO_COMMUNES_URL = "https://geo.api.gouv.fr/communes"

# Opendatasoft-hosted Vigicrues station referential (WGS84 coordinates).
VIGICRUES_REFERENTIAL_URL = (
    "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/"
    "referentiel-des-stations-du-reseau-vigicrues/records"
)

# Vigicrues live feed of "tronçons de vigilance crues" (river sections), each a
# MultiLineString with a section label (`lbentcru`) and vigilance level.
INFOVIGICRU_URL = "https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson/"


@dataclass
class Coordinates:
    lat: float
    lon: float


@dataclass
class VigicruesStation:
    code: str
    river: str | None = None  # watercourse name, when known


def get_coordinates(
    lat: float | None = Query(None, ge=-90, le=90),
    lon: float | None = Query(None, ge=-180, le=180),
) -> Coordinates:
    """FastAPI dependency: request coordinates, or the configured default."""
    return Coordinates(
        settings.LATITUDE if lat is None else lat,
        settings.LONGITUDE if lon is None else lon,
    )


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points, in kilometres."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


async def resolve_department(client: httpx.AsyncClient, lat: float, lon: float) -> str:
    """
    Department code (e.g. "69") for the commune containing the point.
    Falls back to the configured METEOFRANCE_DEPT on any failure.
    """
    try:
        resp = await client.get(
            GEO_COMMUNES_URL,
            params={"lat": lat, "lon": lon, "fields": "codeDepartement"},
        )
        if resp.status_code == 200:
            data = resp.json()
            if data and data[0].get("codeDepartement"):
                return data[0]["codeDepartement"]
    except (httpx.RequestError, ValueError, KeyError, IndexError):
        pass
    return settings.METEOFRANCE_DEPT


async def resolve_place(client: httpx.AsyncClient, lat: float, lon: float) -> tuple[str | None, str | None]:
    """
    (commune name, department code) for the point — e.g. ("Fos-sur-Mer", "13").
    Either element is None when it can't be resolved.
    """
    try:
        resp = await client.get(
            GEO_COMMUNES_URL,
            params={"lat": lat, "lon": lon, "fields": "nom,codeDepartement"},
        )
        if resp.status_code == 200:
            data = resp.json()
            if data:
                return data[0].get("nom"), data[0].get("codeDepartement")
    except (httpx.RequestError, ValueError, KeyError, IndexError):
        pass
    return None, None


def _river_from_label(label: str | None) -> str | None:
    """
    Extract the watercourse from a SANDRE station label, which reads
    "<cours d'eau> à <commune>" (e.g. "Le Rhône à Lyon" -> "Le Rhône").
    """
    if not label:
        return None
    river = re.split(r"\s+à\s+", label, maxsplit=1)[0].strip()
    return river or None


async def nearest_vigicrues_station(client: httpx.AsyncClient, lat: float, lon: float) -> VigicruesStation:
    """
    Closest Vigicrues station to the point (searched within 50 km, closest
    picked by great-circle distance), with its watercourse name when available.
    Falls back to the configured VIGICRUES_STATION_CODE on any failure.
    """
    try:
        resp = await client.get(
            VIGICRUES_REFERENTIAL_URL,
            params={
                "where": f"within_distance(coordonneeswgs84, geom'POINT({lon} {lat})', 50km)",
                "select": "cdstationhydro,lbstationhydro,coordonneeswgs84",
                "limit": 100,
            },
        )
        if resp.status_code == 200:
            records = resp.json().get("results", [])
            best = None
            best_dist = float("inf")
            for rec in records:
                coord = rec.get("coordonneeswgs84") or {}
                code = rec.get("cdstationhydro")
                if code is None or coord.get("lat") is None or coord.get("lon") is None:
                    continue
                dist = haversine_km(lat, lon, coord["lat"], coord["lon"])
                if dist < best_dist:
                    best_dist = dist
                    best = VigicruesStation(code=code, river=_river_from_label(rec.get("lbstationhydro")))
            if best is not None:
                return best
    except (httpx.RequestError, ValueError, KeyError):
        pass
    return VigicruesStation(code=settings.VIGICRUES_STATION_CODE)


# The vigilance-section feed (~2 MB, ~340 sections) is large and its geometry is
# stable, so it's fetched at most once per TTL and shared across requests.
_sections_cache: dict = {"ts": 0.0, "sections": None}
_SECTIONS_TTL = 3600  # seconds


def _flatten_multiline(geometry: dict) -> list[tuple[float, float]]:
    """All (lat, lon) vertices of a MultiLineString geometry."""
    if geometry.get("type") != "MultiLineString":
        return []
    return [(c[1], c[0]) for line in geometry.get("coordinates", []) for c in line if len(c) >= 2]


async def _load_vigilance_sections(client: httpx.AsyncClient) -> list[tuple[str, list[tuple[float, float]]]]:
    """(section name, vertices) for every vigilance section, cached for _SECTIONS_TTL."""
    now = time.monotonic()
    cached = _sections_cache["sections"]
    if cached is not None and now - _sections_cache["ts"] < _SECTIONS_TTL:
        return cached

    resp = await client.get(INFOVIGICRU_URL, follow_redirects=True)
    resp.raise_for_status()
    sections: list[tuple[str, list[tuple[float, float]]]] = []
    for feat in resp.json().get("features", []):
        name = (feat.get("properties") or {}).get("lbentcru")
        pts = _flatten_multiline(feat.get("geometry") or {})
        if name and pts:
            sections.append((name, pts))
    _sections_cache["sections"] = sections
    _sections_cache["ts"] = now
    return sections


async def nearest_vigilance_section(
    client: httpx.AsyncClient, lat: float, lon: float, max_km: float = 30.0
) -> str | None:
    """
    Name of the Vigicrues vigilance section ("tronçon de vigilance crues", e.g.
    "Seine à Paris") nearest to the point, or None when none is within max_km or
    the feed is unavailable.
    """
    try:
        sections = await _load_vigilance_sections(client)
    except (httpx.RequestError, httpx.HTTPStatusError, ValueError):
        return None

    best_name = None
    best_pt = None
    best_metric = float("inf")
    for name, pts in sections:
        for plat, plon in pts:
            # Cheap equirectangular metric to rank candidates; France-sized extent.
            dlat = plat - lat
            dlon = (plon - lon) * math.cos(math.radians((lat + plat) / 2))
            metric = dlat * dlat + dlon * dlon
            if metric < best_metric:
                best_metric, best_name, best_pt = metric, name, (plat, plon)

    if best_name is None or best_pt is None:
        return None
    if haversine_km(lat, lon, best_pt[0], best_pt[1]) > max_km:
        return None
    return best_name
