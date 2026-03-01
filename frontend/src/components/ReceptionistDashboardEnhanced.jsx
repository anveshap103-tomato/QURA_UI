import { useState, useEffect } from 'react'
import { API_URL } from '../config'

export default function ReceptionistDashboardEnhanced() {
    const [queue, setQueue] = useState([])
    const [stats, setStats] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        priority: 'Normal',
        symptoms: '',
        isWalkin: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [completingId, setCompletingId] = useState(null)

    const fetchQueue = async () => {
        try {
            const res = await fetch(`${API_URL}/queue`)
            if (res.ok) {
                const data = await res.json()
                setQueue(Array.isArray(data) ? data : [])
                setError(null)
            }
        } catch (err) {
            setError('Cannot connect to server. Ensure backend is running.')
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/queue/stats`)
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch stats')
        }
    }

    useEffect(() => {
        fetchQueue()
        fetchStats()
        const interval = setInterval(() => {
            fetchQueue()
            fetchStats()
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleAddPatient = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/add_patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    priority: formData.priority,
                    symptoms: formData.symptoms,
                    is_walkin: formData.isWalkin
                })
            })
            if (res.ok) {
                setFormData({ name: '', priority: 'Normal', symptoms: '', isWalkin: true })
                fetchQueue()
                fetchStats()
            } else {
                throw new Error('Failed to add patient')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async (patientId, estimatedDuration) => {
        setCompletingId(patientId)
        try {
            // Simulate actual duration (in real app, this would be tracked)
            const actualDuration = Math.floor(estimatedDuration * (0.8 + Math.random() * 0.4))

            const res = await fetch(`${API_URL}/complete_patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    actual_duration: actualDuration
                })
            })
            if (res.ok) {
                fetchQueue()
                fetchStats()
            } else {
                throw new Error('Failed to complete patient')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setCompletingId(null)
        }
    }

    return (
        <div className="dashboard receptionist-dashboard">
            <div className="page-header">
                <h2 className="page-title">Receptionist Dashboard</h2>
                <p className="page-subtitle">AI-powered queue management with real-time optimization</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Enhanced Stats Dashboard */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Patients</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.total_patients}</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                            🚨 {stats.emergency_count} Emergency
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Wait Time</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.average_wait_time}</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>minutes</div>
                    </div>

                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Available</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.next_available_slot}</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>slot time</div>
                    </div>

                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor Utilization</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.doctor_utilization}%</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                            {stats.doctor_utilization > 80 ? '🔥 High' : stats.doctor_utilization > 50 ? '✅ Optimal' : '📊 Low'}
                        </div>
                    </div>
                </div>
            )}

            <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
                <section className="add-patient-card card" style={{ position: 'sticky', top: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>➕ Add Walk-in Patient</h2>
                    <form onSubmit={handleAddPatient}>
                        <div className="form-group">
                            <label>Patient Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter patient name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Symptoms / Chief Complaint</label>
                            <textarea
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                placeholder="e.g., Fever, headache..."
                                rows="3"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '1rem' }}
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                🤖 AI will predict consultation duration
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Priority Level</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                <option value="Normal">✅ Normal</option>
                                <option value="Emergency">🚨 Emergency</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isWalkin}
                                    onChange={(e) => setFormData({ ...formData, isWalkin: e.target.checked })}
                                />
                                <span>Walk-in Patient</span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? '⏳ Adding...' : '✓ Add to Queue'}
                        </button>
                    </form>

                    {/* AI Suggestions Box */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🤖 AI Suggestion
                        </div>
                        <div style={{ opacity: 0.9 }}>
                            {stats && stats.doctor_utilization > 80
                                ? "⚠️ High workload detected. Consider scheduling non-urgent cases for later."
                                : stats && stats.total_patients === 0
                                    ? "✅ Queue is empty. Good time for walk-ins!"
                                    : "📊 Queue is balanced. Continue normal operations."}
                        </div>
                    </div>
                </section>

                <section className="queue-list-card card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', background: 'var(--success-color)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                        Live Queue ({queue.length})
                    </h2>

                    <div className="queue-list">
                        {queue.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                <p>No patients in the queue</p>
                            </div>
                        ) : (
                            queue.map((patient) => (
                                <div key={patient.id} className={`queue-item ${patient.priority.toLowerCase()}`}>
                                    <div className="queue-info" style={{ flex: 1 }}>
                                        <div className="queue-header">
                                            <h3>{patient.name}</h3>
                                            <span className={`badge ${patient.priority.toLowerCase()}`}>
                                                {patient.priority === 'Emergency' ? '🚨' : '✅'} {patient.priority}
                                            </span>
                                            {patient.is_walkin && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: '#fef3c7',
                                                    color: '#92400e',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    🚶 Walk-in
                                                </span>
                                            )}
                                        </div>

                                        {patient.symptoms && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                💬 {patient.symptoms}
                                            </p>
                                        )}

                                        <div className="queue-meta" style={{ marginTop: '0.75rem' }}>
                                            <p>Position: <strong>#{patient.position + 1}</strong></p>
                                            <p>Wait: <strong>{patient.estimated_wait_time} min</strong></p>
                                            <p>Duration: <strong>{patient.estimated_duration} min</strong></p>
                                        </div>

                                        {/* AI Notification */}
                                        {patient.delay_notification && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: '#eff6ff',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                color: '#1e40af'
                                            }}>
                                                📢 {patient.delay_notification}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleComplete(patient.id, patient.estimated_duration)}
                                        className="btn-complete"
                                        disabled={completingId === patient.id}
                                        style={{ minWidth: '100px' }}
                                    >
                                        {completingId === patient.id ? '⏳' : '✓ Complete'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
