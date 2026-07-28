from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException

from config import settings
from location import Coordinates, get_coordinates
from schemas import HazardStatus

router = APIRouter()

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"

HEAT_DANGER_THRESHOLD = 35.0
HEAT_WARNING_THRESHOLD = 30.0


@router.get("/", response_model=HazardStatus)
async def get_heat_status(coords: Coordinates = Depends(get_coordinates)):
    params = {
        "lat": coords.lat,
        "lon": coords.lon,
        "appid": settings.OPENWEATHERMAP_API_KEY,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(OWM_URL, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="OpenWeatherMap API unavailable")

    data = response.json()
    temp = data["main"]["temp"]
    city = data.get("name", f"{coords.lat}, {coords.lon}")
    last_updated = datetime.fromtimestamp(data["dt"], tz=timezone.utc).isoformat()

    if temp > HEAT_DANGER_THRESHOLD:
        severity = "danger"
        description = f"Canicule : {temp:.1f}°C dépasse le seuil de {HEAT_DANGER_THRESHOLD}°C"
    elif temp > HEAT_WARNING_THRESHOLD:
        severity = "warning"
        description = f"Chaleur élevée : {temp:.1f}°C approche le seuil de canicule ({HEAT_DANGER_THRESHOLD}°C)"
    else:
        severity = "ok"
        description = f"Température normale : {temp:.1f}°C"

    return HazardStatus(
        hazard="heat",
        severity=severity,
        value=round(temp, 1),
        unit="°C",
        location=city,
        description=description,
        source="OpenWeatherMap",
        last_updated=last_updated,
    )
