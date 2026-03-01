from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum
from typing import Optional

class PriorityEnum(str, Enum):
    normal = "Normal"
    emergency = "Emergency"

class PatientCreate(BaseModel):
    name: str
    priority: PriorityEnum
    symptoms: Optional[str] = None
    preferred_time: Optional[str] = None
    estimated_duration: Optional[int] = 15
    is_walkin: Optional[bool] = False

class PatientResponse(BaseModel):
    id: int
    name: str
    priority: str
    symptoms: Optional[str] = None
    arrival_time: datetime
    status: str
    position: Optional[int] = None
    estimated_wait_time: Optional[int] = None
    estimated_duration: int
    predicted_consultation_time: Optional[str] = None
    delay_notification: Optional[str] = None
    is_walkin: bool

    model_config = ConfigDict(from_attributes=True)

class PatientComplete(BaseModel):
    patient_id: int
    actual_duration: Optional[int] = None

class QueueStats(BaseModel):
    total_patients: int
    emergency_count: int
    normal_count: int
    average_wait_time: float
    doctor_utilization: float
    next_available_slot: str
