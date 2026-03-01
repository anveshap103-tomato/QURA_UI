import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import ReceptionistDashboard from './components/ReceptionistDashboard'
import UserDashboard from './components/UserDashboard'
import './index.css'

function App() {
    const [user, setUser] = useState(null)

    return (
        <BrowserRouter>
            <div className="app-wrapper">
                {user && (
                    <nav className="navbar">
                        <div className="navbar-container">
                            <div className="navbar-brand">
                                <div className="logo-icon">Q</div>
                                <div className="brand-text">
                                    <h1>QURA</h1>
                                    <p>Smart Clinic Queue System</p>
                                </div>
                            </div>
                            <div className="navbar-actions">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{user.name}</span>
                                        <span className="user-role">{user.role}</span>
                                    </div>
                                </div>
                                <button className="btn-logout" onClick={() => setUser(null)}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>
                )}

                <div className="container">
                    <Routes>
                        <Route
                            path="/"
                            element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage onLogin={setUser} />}
                        />
                        <Route
                            path="/receptionist"
                            element={user?.role === 'receptionist' ? <ReceptionistDashboard /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/user"
                            element={user?.role === 'user' ? <UserDashboard user={user} /> : <Navigate to="/" />}
                        />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
