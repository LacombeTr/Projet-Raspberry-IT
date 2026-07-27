from typing import Optional

from pydantic import BaseModel


class HazardStatus(BaseModel):
    hazard: str
    severity: str          # "ok" | "warning" | "danger"
    value: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    description: str
    source: str
    last_updated: str


class HumidexStatus(BaseModel):
    temperature: Optional[float] = None   # °C, lu sur le capteur DHT11
    humidity: Optional[float] = None      # %, lu sur le capteur DHT11
    humidex: Optional[float] = None       # indice calculé
    severity: str          # "ok" | "inconfort" | "grand_inconfort" | "warning" | "danger"
    description: str
    source: str
    last_updated: str
