from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text
from datetime import datetime, timezone
from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    priority = Column(String, default="Normal")
    symptoms = Column(Text, nullable=True)
    preferred_time = Column(String, nullable=True)
    arrival_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="Waiting")
    estimated_duration = Column(Integer, default=15)
    actual_duration = Column(Integer, nullable=True)
    consultation_start = Column(DateTime, nullable=True)
    consultation_end = Column(DateTime, nullable=True)
    is_walkin = Column(Boolean, default=False)
    notification_sent = Column(Boolean, default=False)
