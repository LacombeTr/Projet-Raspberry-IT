from fastapi import APIRouter

from schemas import HazardStatus

router = APIRouter()

MOCK_DATA = HazardStatus(
    hazard="heat",
    severity="warning",
    value=36.2,
    unit="°C",
    location="Marseille, FR",
    description="Chaleur élevée : 36.2°C approche le seuil de canicule (35°C)",
    source="OpenWeatherMap (mock)",
    last_updated="2026-07-06T10:00:00Z",
)


@router.get("/", response_model=HazardStatus)
async def get_heat_status():
    # TODO: replace with real OpenWeatherMap API call
    return MOCK_DATA
