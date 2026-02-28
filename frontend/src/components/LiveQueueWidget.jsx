import { useState, useEffect } from 'react'
import { UserGroupIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function LiveQueueWidget({ queue, user }) {
    const [progress, setProgress] = useState({ percentage: 0, minsRemaining: 15 })

    // Find currently consulting patient
    const currentlyConsulting = queue.length > 0 ? queue[0] : null

    // Find current user's position
    const myQueueInfo = user ? queue.find(p => p.name.toLowerCase() === user.name.toLowerCase()) : null

    // Patients ahead calculation
    let patientsAhead = 0
    if (myQueueInfo) {
        patientsAhead = myQueueInfo.position // If my position is 3, there are 3 people ahead (pos 0, 1, 2)
    } else if (queue.length > 0) {
        patientsAhead = queue.length - 1 // If not me, everyone but the currently consulting
    }

    // Calculate dynamic progress based on the current patient's arrival time
    useEffect(() => {
        let interval;
        const calculateProgress = () => {
            if (currentlyConsulting) {
                // Assume 15 mins (900000 ms) total consultation time per patient
                const totalDurationMs = 15 * 60 * 1000
                const arrivalTimeMs = new Date(currentlyConsulting.arrival_time + 'Z').getTime() // Ensure UTC parsing
                const elapsedMs = Math.max(0, Date.now() - arrivalTimeMs)

                let percentage = (elapsedMs / totalDurationMs) * 100
                if (percentage > 99) percentage = 99 // Cap it so it doesn't stay at 100% while waiting to be completed

                const remainingMs = Math.max(0, totalDurationMs - elapsedMs)
                const minsRemaining = Math.ceil(remainingMs / 60000)

                setProgress({ percentage: Math.floor(percentage), minsRemaining })
            } else {
                setProgress({ percentage: 0, minsRemaining: 0 })
            }
        }

        calculateProgress()
        interval = setInterval(calculateProgress, 5000) // Update every 5 seconds

        return () => clearInterval(interval)
    }, [currentlyConsulting])

    // Helper to render bubbles
    const renderBubbles = (total) => {
        const maxVisible = 4
        const bubbles = []

        for (let i = 1; i <= Math.min(total, maxVisible); i++) {
            bubbles.push(
                <div key={i} className="queue-bubble">
                    {i}
                </div>
            )
        }

        if (total > maxVisible) {
            bubbles.push(
                <div key="overflow" className="queue-bubble overflow">
                    +{total - maxVisible}
                </div>
            )
        }

        return bubbles
    }

    return (
        <div className="live-queue-widget">
            {/* 1. Header Section */}
            <div className="lqw-header">
                <div className="lqw-icon-bg">
                    <UserGroupIcon className="lqw-icon" />
                </div>
                <div className="lqw-header-text">
                    <h3>Live Queue</h3>
                    <p>Current queue information</p>
                </div>
            </div>

            {/* 2. Currently Consulting Card */}
            <div className="lqw-card">
                <div className="lqw-card-content consulting-content">
                    <div className="lqw-avatar-bg">
                        <UserIcon className="lqw-avatar-icon" />
                    </div>
                    <div className="lqw-info">
                        <span className="lqw-label">CURRENTLY CONSULTING</span>
                        <h4 className="lqw-patient-name">
                            {currentlyConsulting ? currentlyConsulting.name : 'Waiting for patient...'}
                        </h4>
                    </div>
                    <button className="lqw-action-btn" title="View Patient Details">
                        <ArrowRightIcon className="lqw-arrow-icon" />
                    </button>
                </div>
            </div>

            {/* 3. Patients Ahead of You Card */}
            <div className="lqw-card">
                <div className="lqw-card-content ahead-content">
                    <div className="lqw-ahead-left">
                        <span className="lqw-label">{myQueueInfo ? 'PATIENTS AHEAD OF YOU' : 'WAITING PATIENTS'}</span>
                        <div className="lqw-ahead-count">{patientsAhead}</div>
                    </div>
                    <div className="lqw-bubbles-container">
                        {renderBubbles(patientsAhead)}
                    </div>
                </div>
            </div>

            {/* 4. Current Consultation Progress Bar */}
            <div className="lqw-progress-container">
                <div className="lqw-progress-header">
                    <span className="lqw-label">CURRENT CONSULTATION PROGRESS</span>
                    <span className="lqw-percentage">{progress.percentage}%</span>
                </div>
                <div className="lqw-progress-bar-bg">
                    <div
                        className="lqw-progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                    ></div>
                </div>
                <p className="lqw-progress-subtitle">
                    Estimated {progress.minsRemaining} min remaining for current patient
                </p>
            </div>
        </div>
    )
}
