from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import case
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime, timezone, timedelta

import models
import schemas
from database import engine, SessionLocal
from ai_engine import AIOptimizationEngine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QURA AI-Powered Queue Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to QURA - AI-Powered Queue Management System",
        "version": "2.0",
        "docs": "/docs"
    }

@app.post("/add_patient", response_model=schemas.PatientResponse)
def add_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    # AI prediction for consultation duration
    predicted_duration = AIOptimizationEngine.predict_consultation_duration(
        symptoms=patient.symptoms,
        priority=patient.priority.value
    )
    
    db_patient = models.Patient(
        name=patient.name,
        priority=patient.priority.value,
        symptoms=patient.symptoms,
        preferred_time=patient.preferred_time,
        estimated_duration=predicted_duration,
        is_walkin=patient.is_walkin
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Get optimized queue
    patients = db.query(models.Patient).filter(models.Patient.status == "Waiting").order_by(
        case(
            (models.Patient.priority == "Emergency", 0),
            else_=1
        ),
        models.Patient.arrival_time.asc()
    ).all()
    
    # Calculate position and wait time using AI
    position = -1
    queue_data = []
    for idx, p in enumerate(patients):
        queue_data.append({
            'id': p.id,
            'priority': p.priority,
            'estimated_duration': p.estimated_duration,
            'arrival_time': p.arrival_time
        })
        if p.id == db_patient.id:
            position = idx
    
    estimated_wait = AIOptimizationEngine.calculate_optimal_wait_time(position, queue_data, predicted_duration)
    
    # Generate notification
    notification = AIOptimizationEngine.generate_notification(
        {'priority': db_patient.priority, 'is_walkin': db_patient.is_walkin},
        position,
        estimated_wait
    )
    
    return schemas.PatientResponse(
        id=db_patient.id,
        name=db_patient.name,
        priority=db_patient.priority,
        symptoms=db_patient.symptoms,
        arrival_time=db_patient.arrival_time,
        status=db_patient.status,
        position=position,
        estimated_wait_time=estimated_wait,
        estimated_duration=predicted_duration,
        delay_notification=notification,
        is_walkin=db_patient.is_walkin
    )

@app.get("/queue", response_model=List[schemas.PatientResponse])
def get_queue(db: Session = Depends(get_db)):
    patients = db.query(models.Patient).filter(models.Patient.status == "Waiting").order_by(
        case(
            (models.Patient.priority == "Emergency", 0),
            else_=1
        ),
        models.Patient.arrival_time.asc()
    ).all()
    
    responses = []
    cumulative_wait = 0
    
    for idx, p in enumerate(patients):
        # Generate real-time notification
        notification = AIOptimizationEngine.generate_notification(
            {'priority': p.priority, 'is_walkin': p.is_walkin},
            idx,
            cumulative_wait
        )
        
        responses.append(schemas.PatientResponse(
            id=p.id,
            name=p.name,
            priority=p.priority,
            symptoms=p.symptoms,
            arrival_time=p.arrival_time,
            status=p.status,
            position=idx,
            estimated_wait_time=cumulative_wait,
            estimated_duration=p.estimated_duration,
            delay_notification=notification,
            is_walkin=p.is_walkin
        ))
        
        cumulative_wait += p.estimated_duration
    
    return responses

@app.post("/complete_patient")
def complete_patient(req: schemas.PatientComplete, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Record actual duration if provided
    if req.actual_duration:
        patient.actual_duration = req.actual_duration
        
        # Smart time utilization: Check if time was freed
        freed_time = patient.estimated_duration - req.actual_duration
        if freed_time > 0:
            # Get waiting patients
            waiting = db.query(models.Patient).filter(models.Patient.status == "Waiting").all()
            waiting_data = [{'id': p.id, 'priority': p.priority, 'is_walkin': p.is_walkin} for p in waiting]
            
            reallocation = AIOptimizationEngine.reallocate_freed_time(freed_time, waiting_data)
    
    patient.status = "Completed"
    patient.consultation_end = datetime.now(timezone.utc)
    db.commit()
    
    return {
        "message": "Patient completed successfully",
        "patient_id": patient.id,
        "actual_duration": patient.actual_duration
    }

@app.get("/queue/stats", response_model=schemas.QueueStats)
def get_queue_stats(db: Session = Depends(get_db)):
    waiting_patients = db.query(models.Patient).filter(models.Patient.status == "Waiting").all()
    completed_today = db.query(models.Patient).filter(
        models.Patient.status == "Completed",
        models.Patient.arrival_time >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
    ).all()
    
    total_patients = len(waiting_patients)
    emergency_count = len([p for p in waiting_patients if p.priority == "Emergency"])
    normal_count = total_patients - emergency_count
    
    # Calculate average wait time
    if waiting_patients:
        total_wait = sum([p.estimated_duration for p in waiting_patients])
        avg_wait = total_wait / len(waiting_patients)
    else:
        avg_wait = 0
    
    # Calculate doctor utilization (8 hour workday = 480 minutes)
    total_consultation_time = sum([p.actual_duration or p.estimated_duration for p in completed_today])
    utilization = AIOptimizationEngine.calculate_doctor_utilization(total_consultation_time, 480)
    
    # Next available slot
    if waiting_patients:
        total_queue_time = sum([p.estimated_duration for p in waiting_patients])
        next_slot = (datetime.now(timezone.utc) + timedelta(minutes=total_queue_time)).strftime("%I:%M %p")
    else:
        next_slot = "Now"
    
    return schemas.QueueStats(
        total_patients=total_patients,
        emergency_count=emergency_count,
        normal_count=normal_count,
        average_wait_time=round(avg_wait, 1),
        doctor_utilization=round(utilization, 1),
        next_available_slot=next_slot
    )
