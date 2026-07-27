from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from config import settings
from schemas import HazardStatus

router = APIRouter()

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"

WIND_DANGER_THRESHOLD = 60.0
WIND_WARNING_THRESHOLD = 40.0


@router.get("/", response_model=HazardStatus)
async def get_wind_status():
    params = {
        "lat": settings.LATITUDE,
        "lon": settings.LONGITUDE,
        "appid": settings.OPENWEATHERMAP_API_KEY,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(OWM_URL, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="OpenWeatherMap API unavailable")

    data = response.json()
    wind_ms = data["wind"]["speed"]
    wind_kmh = round(wind_ms * 3.6, 1)
    city = data.get("name", f"{settings.LATITUDE}, {settings.LONGITUDE}")
    last_updated = datetime.fromtimestamp(data["dt"], tz=timezone.utc).isoformat()

    if wind_kmh > WIND_DANGER_THRESHOLD:
        severity = "danger"
        description = f"Vent violent : {wind_kmh} km/h dépasse le seuil de {WIND_DANGER_THRESHOLD} km/h"
    elif wind_kmh > WIND_WARNING_THRESHOLD:
        severity = "warning"
        description = f"Vent fort : {wind_kmh} km/h approche le seuil de vigilance ({WIND_DANGER_THRESHOLD} km/h)"
    else:
        severity = "ok"
        description = f"Vent normal : {wind_kmh} km/h"

    return HazardStatus(
        hazard="wind",
        severity=severity,
        value=wind_kmh,
        unit="km/h",
        location=city,
        description=description,
        source="OpenWeatherMap",
        last_updated=last_updated,
    )
