import { useState, useEffect } from 'react'
import LiveQueueWidget from './LiveQueueWidget'

export default function UserDashboard({ user }) {
    const [queue, setQueue] = useState([])
    const [isBooked, setIsBooked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchQueue = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/queue`)
            if (res.ok) {
                const data = await res.json()
                setQueue(data)

                const mypos = data.find(p => p.name.toLowerCase() === user.name.toLowerCase())
                if (mypos) setIsBooked(true)
                else setIsBooked(false)

                setError(null)
            } else {
                throw new Error('Failed to fetch queue')
            }
        } catch (err) {
            setError('Cannot connect to server. Ensure backend is running.')
        }
    }

    useEffect(() => {
        fetchQueue()
        const interval = setInterval(fetchQueue, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleBookAppointment = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/add_patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: user.name, priority: 'Normal' })
            })
            if (res.ok) {
                setIsBooked(true)
                fetchQueue()
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

            <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <section className="user-action-card card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>📋 Book an Appointment</h2>
                    {!isBooked ? (
                        <form onSubmit={handleBookAppointment}>
                            <p className="booking-info" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
                                You will be added to the queue as: <strong style={{ color: 'var(--primary-dark)' }}>{user.name}</strong>
                            </p>
                            <button type="submit" disabled={loading} className="btn-primary btn-large">
                                {loading ? '⏳ Booking...' : '✓ Book Now'}
                            </button>
                        </form>
                    ) : (
                        <div className="booked-success">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ color: 'var(--success-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Appointment Confirmed!</h3>
                            {myQueueInfo && (
                                <div className="ticket">
                                    <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Your Position: <span className="highlight">#{myQueueInfo.position + 1}</span></p>
                                    <p style={{ fontSize: '1rem' }}>Estimated Wait: <span className="highlight">{myQueueInfo.estimated_wait_time} mins</span></p>
                                </div>
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
