import asyncio
from datetime import date

import httpx
from fastapi import APIRouter, Depends, HTTPException

from config import settings
from location import Coordinates, get_coordinates, haversine_km, resolve_place
from schemas import FirePoint, HazardStatus

router = APIRouter()

@router.get("/", response_model=HazardStatus)
async def get_fire_status(coords: Coordinates = Depends(get_coordinates)):
    today = date.today().isoformat()
    url = settings.FIRMS_URL.format(key=settings.NASA_FIRMS_API_KEY, FIRMS_SOURCE=settings.FIRMS_SOURCE, date=today)

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="NASA FIRMS API unavailable")

    lines = response.text.strip().splitlines()
    nearby_fires: list[FirePoint] = []
    for line in lines[1:]:  # skip CSV header
        parts = line.split(",")
        # FIRMS MODIS CSV: latitude, longitude, brightness, scan, track, acq_date, acq_time, ...
        if len(parts) < 2:
            continue
        try:
            fire_lat, fire_lon = float(parts[0]), float(parts[1])
        except ValueError:
            continue
        dist = haversine_km(coords.lat, coords.lon, fire_lat, fire_lon)
        if dist > settings.FIRE_RADIUS_KM:
            continue

        brightness = None
        if len(parts) > 2:
            try:
                brightness = float(parts[2])
            except ValueError:
                brightness = None

        acquired = None
        if len(parts) > 6:
            acq_date, acq_time = parts[5], parts[6].zfill(4)
            acquired = f"{acq_date} {acq_time[:2]}:{acq_time[2:]}"

        nearby_fires.append(
            FirePoint(
                latitude=fire_lat,
                longitude=fire_lon,
                distance_km=round(dist, 1),
                brightness=brightness,
                acquired=acquired,
            )
        )

    # Reverse-geocode each detection to its commune + department (concurrently,
    # best-effort).
    if nearby_fires:
        async with httpx.AsyncClient(timeout=10) as client:
            places = await asyncio.gather(
                *(resolve_place(client, f.latitude, f.longitude) for f in nearby_fires)
            )
        for fire, (commune, department) in zip(nearby_fires, places):
            fire.commune = commune
            fire.department = department

    if nearby_fires:
        closest = min(f.distance_km for f in nearby_fires)
        severity = "danger"
        description = f"{len(nearby_fires)} feu(x) actif(s) détecté(s) — le plus proche à {closest} km"
    else:
        severity = "ok"
        description = f"Aucun feu actif détecté dans un rayon de {settings.FIRE_RADIUS_KM} km"

    return HazardStatus(
        hazard="fire",
        severity=severity,
        location=f"{coords.lat}, {coords.lon}",
        description=description,
        source="NASA FIRMS (MODIS_NRT)",
        last_updated=today,
        fires=nearby_fires,
    )
