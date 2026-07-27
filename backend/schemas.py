from typing import List, Optional

from pydantic import BaseModel


class FirePoint(BaseModel):
    """A single active-fire detection returned by NASA FIRMS."""
    latitude: float
    longitude: float
    distance_km: float
    brightness: Optional[float] = None
    acquired: Optional[str] = None  # "YYYY-MM-DD HH:MM" (UTC)


class HazardStatus(BaseModel):
    hazard: str
    severity: str          # "ok" | "warning" | "danger"
    value: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    description: str
    source: str
    last_updated: str
    fires: Optional[List[FirePoint]] = None  # only populated by the fire endpoint
