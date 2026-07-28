from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException

from config import settings
from location import (
    Coordinates,
    get_coordinates,
    nearest_vigicrues_station,
    nearest_vigilance_section,
    resolve_department,
)
from schemas import HazardStatus

router = APIRouter()

VIGICRUES_URL = "https://api.vigicrues.gouv.fr/1/Observations.json/"
METEOFRANCE_VIGILANCE_URL = "https://public-api.meteofrance.fr/public/DPVigilance/v1/textesvigilance/encours"

_SEVERITY_RANK = {"ok": 0, "warning": 1, "danger": 2}


def _vigicrues_level_to_severity(level: int) -> str:
    if level >= 3:
        return "danger"
    if level == 2:
        return "warning"
    return "ok"


def _meteofrance_color_to_severity(color: str) -> str:
    color = color.lower()
    if color in ("orange", "rouge"):
        return "danger"
    if color == "jaune":
        return "warning"
    return "ok"


def _worst(a: str, b: str) -> str:
    return a if _SEVERITY_RANK[a] >= _SEVERITY_RANK[b] else b


@router.get("/", response_model=HazardStatus)
async def get_flood_status(coords: Coordinates = Depends(get_coordinates)):
    now = datetime.now(tz=timezone.utc).isoformat()
    vigicrues_severity = None
    meteofrance_severity = None
    sources = []

    async with httpx.AsyncClient(timeout=10) as client:
        # Derive the flood context from the requested coordinate: the nearest
        # Vigicrues station and the department the point falls in. Both degrade
        # to the configured defaults if their lookup fails.
        station = await nearest_vigicrues_station(client, coords.lat, coords.lon)
        dept = await resolve_department(client, coords.lat, coords.lon)
        section = await nearest_vigilance_section(client, coords.lat, coords.lon)

        # --- Vigicrues ---
        try:
            vc_resp = await client.get(
                VIGICRUES_URL,
                params={
                    "CdStationHydro": station.code,
                    "GrdSerie": "H",
                    "FormatSortie": "simple",
                },
            )
            if vc_resp.status_code == 200:
                vc_data = vc_resp.json()
                level = vc_data.get("TypEntVigiCru", 1)
                vigicrues_severity = _vigicrues_level_to_severity(int(level))
                sources.append("Vigicrues")
        except httpx.RequestError:
            pass

        # --- Météo-France Vigilance ---
        try:
            mf_resp = await client.get(
                METEOFRANCE_VIGILANCE_URL,
                headers={"apikey": settings.METEOFRANCE_API_KEY},
            )
            if mf_resp.status_code == 200:
                mf_data = mf_resp.json()
                dept_color = "vert"
                for item in mf_data.get("product", {}).get("text_bloc_items", []):
                    if item.get("domain_id") == dept:
                        for phenomenon in item.get("phenomenon_items", []):
                            if "inondation" in phenomenon.get("phenomenon_max_color_id", "").lower() or \
                               phenomenon.get("phenomenon_id") in ("6", "4"):
                                dept_color = phenomenon.get("phenomenon_max_color_id", "vert")
                meteofrance_severity = _meteofrance_color_to_severity(dept_color)
                sources.append("Météo-France")
        except httpx.RequestError:
            pass

    if vigicrues_severity is None and meteofrance_severity is None:
        raise HTTPException(status_code=502, detail="Vigicrues and Météo-France APIs unavailable")

    severity = _worst(
        vigicrues_severity or "ok",
        meteofrance_severity or "ok",
    )

    source_str = " + ".join(sources) if sources else "Vigicrues + Météo-France"

    if severity == "danger":
        description = "Vigilance orange/rouge — risque de crue sur le secteur surveillé"
    elif severity == "warning":
        description = "Vigilance jaune — surveillance accrue du cours d'eau"
    else:
        description = "Aucun risque de crue détecté"

    return HazardStatus(
        hazard="flood",
        severity=severity,
        value=None,
        unit=None,
        location=(
            f"{section} (Dépt. {dept})"
            if section
            else f"{station.river} (Dépt. {dept})"
            if station.river
            else f"Station {station.code} (Dépt. {dept})"
        ),
        description=description,
        source=source_str,
        last_updated=now,
    )
