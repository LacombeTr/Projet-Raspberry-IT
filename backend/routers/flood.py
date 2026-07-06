from fastapi import APIRouter

from schemas import HazardStatus

router = APIRouter()

MOCK_DATA = HazardStatus(
    hazard="flood",
    severity="warning",
    value=None,
    unit=None,
    location="Bassin du Rhône",
    description="Vigilance Orange — risque de crue sur le bassin du Rhône",
    source="Vigicrues + Météo-France (mock)",
    last_updated="2026-07-06T10:00:00Z",
)


@router.get("/", response_model=HazardStatus)
async def get_flood_status():
    # TODO: replace with real Vigicrues / Météo-France API call
    return MOCK_DATA
