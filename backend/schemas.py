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
