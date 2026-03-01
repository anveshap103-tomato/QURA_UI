import random
from datetime import datetime, timedelta
from typing import List, Dict

class AIOptimizationEngine:
    """AI-powered queue optimization engine"""
    
    # Historical data simulation (in real app, this would be from database)
    SYMPTOM_DURATION_MAP = {
        "fever": 12,
        "cold": 10,
        "cough": 10,
        "headache": 8,
        "stomach": 15,
        "injury": 20,
        "checkup": 15,
        "emergency": 25,
        "default": 15
    }
    
    @staticmethod
    def predict_consultation_duration(symptoms: str = None, priority: str = "Normal") -> int:
        """
        Predict consultation duration based on symptoms and priority
        Uses AI/ML simulation (in production, this would be a trained model)
        """
        base_duration = 15
        
        if priority == "Emergency":
            base_duration = 25
        
        if symptoms:
            symptoms_lower = symptoms.lower()
            for keyword, duration in AIOptimizationEngine.SYMPTOM_DURATION_MAP.items():
                if keyword in symptoms_lower:
                    base_duration = duration
                    break
        
        # Add slight randomness to simulate real-world variation
        variation = random.randint(-2, 3)
        return max(5, base_duration + variation)
    
    @staticmethod
    def calculate_optimal_wait_time(position: int, queue: List, estimated_duration: int) -> int:
        """
        Calculate optimized wait time considering:
        - Current queue position
        - Estimated durations of patients ahead
        - Emergency prioritization
        """
        total_wait = 0
        
        for i in range(position):
            if i < len(queue):
                patient = queue[i]
                total_wait += patient.get('estimated_duration', 15)
        
        return total_wait
    
    @staticmethod
    def optimize_queue(patients: List[Dict]) -> List[Dict]:
        """
        Optimize queue order based on:
        - Priority (Emergency first)
        - Arrival time
        - Predicted duration (shorter consultations can be prioritized)
        """
        # Separate emergency and normal patients
        emergency = [p for p in patients if p['priority'] == 'Emergency']
        normal = [p for p in patients if p['priority'] == 'Normal']
        
        # Sort emergency by arrival time
        emergency.sort(key=lambda x: x['arrival_time'])
        
        # Sort normal patients by arrival time
        normal.sort(key=lambda x: x['arrival_time'])
        
        # Combine: Emergency first, then normal
        optimized = emergency + normal
        
        return optimized
    
    @staticmethod
    def detect_delays(current_time: datetime, scheduled_time: datetime) -> str:
        """
        Detect if there's a delay and generate notification message
        """
        delay_minutes = int((current_time - scheduled_time).total_seconds() / 60)
        
        if delay_minutes > 5:
            return f"Doctor running {delay_minutes} mins late"
        elif delay_minutes < -5:
            return f"You may arrive {abs(delay_minutes)} mins early due to cancellation"
        
        return None
    
    @staticmethod
    def calculate_doctor_utilization(total_consultation_time: int, total_available_time: int) -> float:
        """
        Calculate doctor utilization percentage
        """
        if total_available_time == 0:
            return 0.0
        
        utilization = (total_consultation_time / total_available_time) * 100
        return min(100.0, utilization)
    
    @staticmethod
    def reallocate_freed_time(freed_minutes: int, waiting_patients: List[Dict]) -> Dict:
        """
        Smart time utilization: Reallocate freed time from early completions
        """
        if freed_minutes <= 0 or not waiting_patients:
            return {"reallocated": False, "message": "No time to reallocate"}
        
        # Prioritize emergency cases or walk-ins
        priority_patients = [p for p in waiting_patients if p['priority'] == 'Emergency' or p.get('is_walkin')]
        
        if priority_patients:
            return {
                "reallocated": True,
                "message": f"{freed_minutes} mins freed - advancing priority patient",
                "patient_id": priority_patients[0]['id']
            }
        
        # Otherwise advance next patient
        if waiting_patients:
            return {
                "reallocated": True,
                "message": f"{freed_minutes} mins freed - advancing next patient",
                "patient_id": waiting_patients[0]['id']
            }
        
        return {"reallocated": False, "message": "No patients to advance"}
    
    @staticmethod
    def generate_notification(patient: Dict, queue_position: int, estimated_wait: int) -> str:
        """
        Generate personalized notification for patient
        """
        notifications = []
        
        if patient['priority'] == 'Emergency':
            notifications.append("🚨 Emergency case - You will be seen immediately")
        else:
            notifications.append(f"📍 Your position: #{queue_position + 1}")
            notifications.append(f"⏱️ Estimated wait: {estimated_wait} minutes")
        
        if estimated_wait > 30:
            notifications.append("⚠️ Longer wait expected - You may step out briefly")
        elif estimated_wait < 10:
            notifications.append("✅ Please be ready - You're up soon!")
        
        return " | ".join(notifications)
