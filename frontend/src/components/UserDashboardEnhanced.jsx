import { useState, useEffect } from 'react'
import LiveQueueWidget from './LiveQueueWidget'

export default function UserDashboard({ user }) {
    const [queue, setQueue] = useState([])
    const [stats, setStats] = useState(null)
    const [isBooked, setIsBooked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        symptoms: '',
        preferredTime: '',
        priority: 'Normal'
    })

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:8000/queue')
            if (res.ok) {
                const data = await res.json()
                setQueue(data)

                const mypos = data.find(p => p.name.toLowerCase() === user.name.toLowerCase())
                if (mypos) setIsBooked(true)
                else setIsBooked(false)

                setError(null)
            }
        } catch (err) {
            setError('Cannot connect to server. Ensure backend is running.')
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch('https://qura-ui-2.onrender.com')
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

    const handleBookAppointment = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('http://localhost:8000/add_patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name,
                    priority: formData.priority,
                    symptoms: formData.symptoms,
                    preferred_time: formData.preferredTime,
                    is_walkin: false
                })
            })
            if (res.ok) {
                setIsBooked(true)
                fetchQueue()
                fetchStats()
            } else {
                throw new Error('Failed to book appointment')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const myQueueInfo = queue.find(p => p.name.toLowerCase() === user.name.toLowerCase())

    return (
        <div className="dashboard user-dashboard">
            <div className="page-header">
                <h2 className="page-title">Patient Dashboard</h2>
                <p className="page-subtitle">Book your appointment and track your queue position in real-time</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total in Queue</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.total_patients}</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Avg Wait Time</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.average_wait_time} min</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Next Available</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.next_available_slot}</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Doctor Utilization</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{stats.doctor_utilization}%</div>
                    </div>
                </div>
            )}

            <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <section className="user-action-card card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>📋 Book an Appointment</h2>
                    {!isBooked ? (
                        <form onSubmit={handleBookAppointment}>
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input
                                    type="text"
                                    value={user.name}
                                    disabled
                                    style={{ background: '#f5f8fa', cursor: 'not-allowed' }}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Symptoms / Reason for Visit</label>
                                <textarea
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    placeholder="e.g., Fever, headache, cough..."
                                    rows="3"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '1rem' }}
                                    required
                                />
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    💡 AI will predict consultation time based on your symptoms
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Preferred Time (Optional)</label>
                                <input
                                    type="time"
                                    value={formData.preferredTime}
                                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Priority</label>
                                <select 
                                    value={formData.priority} 
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Normal">✅ Normal</option>
                                    <option value="Emergency">🚨 Emergency</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary btn-large">
                                {loading ? '⏳ Booking...' : '✓ Book Now'}
                            </button>
                        </form>
                    ) : (
                        <div className="booked-success">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ color: 'var(--success-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Appointment Confirmed!</h3>
                            {myQueueInfo && (
                                <>
                                    <div className="ticket">
                                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            Your Position: <span className="highlight">#{myQueueInfo.position + 1}</span>
                                        </p>
                                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            Estimated Wait: <span className="highlight">{myQueueInfo.estimated_wait_time} mins</span>
                                        </p>
                                        <p style={{ fontSize: '1rem' }}>
                                            Consultation Time: <span className="highlight">{myQueueInfo.estimated_duration} mins</span>
                                        </p>
                                    </div>
                                    
                                    {/* Real-time Notification */}
                                    {myQueueInfo.delay_notification && (
                                        <div style={{ 
                                            marginTop: '1rem', 
                                            padding: '1rem', 
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}>
                                            📢 {myQueueInfo.delay_notification}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </section>

                <section className="live-widget-section">
                    <LiveQueueWidget queue={queue} user={user} />
                </section>
            </div>
        </div>
    )
}
