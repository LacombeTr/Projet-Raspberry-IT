from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from schemas import HumidexStatus
from sensors.dht11 import dht11

router = APIRouter()

# Calcul de l'humidex
def _compute_humidex(temperature: float, humidity: float) -> float:
    e = 6.112 * (10 ** ((7.5 * temperature) / (237.7 + temperature))) * (humidity / 100)
    return temperature + 0.5555 * (e - 10)


def _severity(humidex: float) -> tuple[str, str]:
    if humidex >= 54:
        return "danger", "Coup de chaleur imminent"
    if humidex >= 45:
        return "warning", "Dangereux : risque de coup de chaleur en cas d'effort prolongé"
    if humidex >= 40:
        return "grand_inconfort", "Grand inconfort, éviter les efforts"
    if humidex >= 30:
        return "inconfort", "Inconfort"
    return "ok", "Aucun inconfort"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.get("/", response_model=HumidexStatus)
async def get_humidex_status():
    
    # Récuperation des données du capteur
    reading = await run_in_threadpool(dht11.read)

    if reading is None:
        # Si le capteur ne renvoi rien on envoi un humidex "vide"
        return HumidexStatus(
            temperature=None,
            humidity=None,
            humidex=None,
            severity="ok",
            description="Capteur indisponible",
            source="DHT11 (capteur local)",
            last_updated=_now(),
        )

    # Si on a un retour on récupère toutes les données et on calcul l'indice
    temperature, humidity = reading
    humidex = _compute_humidex(temperature, humidity)
    severity, description = _severity(humidex)

    return HumidexStatus(
        temperature=round(temperature, 1),
        humidity=round(humidity, 1),
        humidex=round(humidex, 1),
        severity=severity,
        description=description,
        source="DHT11 (capteur local)",
        last_updated=_now(),
    )
