from typing import List, Literal, Optional

from pydantic import BaseModel


class FirePoint(BaseModel):
    """A single active-fire detection returned by NASA FIRMS."""
    latitude: float
    longitude: float
    distance_km: float
    brightness: Optional[float] = None
    acquired: Optional[str] = None  # "YYYY-MM-DD HH:MM" (UTC)
    commune: Optional[str] = None  # commune the detection falls in, when resolved
    department: Optional[str] = None  # department code (e.g. "13"), when resolved


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
    fires: Optional[List[FirePoint]] = None  # only populated by the fire endpoint


class LedRequest(BaseModel):
    severity: Literal["ok", "warning", "danger"]
