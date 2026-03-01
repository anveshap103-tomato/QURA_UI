import { useState } from 'react'

export default function LoginPage({ onLogin }) {
    const [user, setUser] = useState(null)
    const [formData, setFormData] = useState({ name: '', number: '' })

    const handleLoginSubmit = (e) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.number.trim()) return

        setUser({
            name: formData.name.trim(),
            number: formData.number.trim(),
            picture: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`
        })
    }

    const selectRole = (role) => {
        if (user) {
            onLogin({ ...user, role })
        }
    }

    return (
        <div className="login-container">
            {!user ? (
                <div className="login-card card" style={{ maxWidth: '500px', margin: '4rem auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-medium))',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2.5rem',
                            color: 'white',
                            fontWeight: '700'
                        }}>Q</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>Welcome to QURA</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Please enter your details to continue</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="login-form">
                        <div className="form-group text-left">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex. John Doe"
                                required
                            />
                        </div>
                        <div className="form-group text-left">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                placeholder="Ex. +1 234 567 8900"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary mt-4">
                            Continue →
                        </button>
                    </form>
                </div>
            ) : (
                <div className="role-selection-card card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>Welcome, {user.name}! 👋</h2>
                    <img src={user.picture} alt="Profile" className="profile-img" style={{ width: '100px', height: '100px', margin: '1rem auto' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please select your role to continue:</p>
                    <div className="role-buttons" style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-primary role-btn"
                            onClick={() => selectRole('user')}
                            style={{ flex: 1 }}
                        >
                            👤 Patient
                        </button>
                        <button
                            className="btn-secondary role-btn"
                            onClick={() => selectRole('receptionist')}
                            style={{ flex: 1 }}
                        >
                            💼 Receptionist
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
