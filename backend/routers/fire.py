from fastapi import APIRouter

from schemas import HazardStatus

router = APIRouter()

MOCK_DATA = HazardStatus(
    hazard="fire",
    severity="ok",
    value=None,
    unit=None,
    location="Var, FR",
    description="Aucun feu actif détecté dans un rayon de 20 km",
    source="NASA FIRMS (mock)",
    last_updated="2026-07-06T10:00:00Z",
)


@router.get("/", response_model=HazardStatus)
async def get_fire_status():
    # TODO: replace with real NASA FIRMS API call
    return MOCK_DATA
