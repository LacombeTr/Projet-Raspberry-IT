from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from database import Base


class HazardEvent(Base):
    __tablename__ = "hazard_events"

    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(String, nullable=False)  # wind | heat | fire | flood
    severity = Column(String, nullable=False)      # ok | warning | danger
    value = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
