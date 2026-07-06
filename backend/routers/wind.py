from fastapi import APIRouter

from schemas import HazardStatus

router = APIRouter()

MOCK_DATA = HazardStatus(
    hazard="wind",
    severity="danger",
    value=72.5,
    unit="km/h",
    location="Marseille, FR",
    description="Vent violent : 72.5 km/h dépasse le seuil de 60 km/h",
    source="OpenWeatherMap (mock)",
    last_updated="2026-07-06T10:00:00Z",
)


@router.get("/", response_model=HazardStatus)
async def get_wind_status():
    # TODO: replace with real OpenWeatherMap API call
    return MOCK_DATA
