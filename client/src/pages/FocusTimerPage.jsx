import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/focus.css';

const FocusTimerPage = () => {
    const [mode, setMode] = useState('focus'); // focus, short, long
    const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    // Session details form
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');

    // Stats & History from MongoDB
    const [stats, setStats] = useState({
        todayMinutes: 0,
        currentHours: '0.0',
        goalHours: '4.0',
        completedSessions: 0,
        progress: 0
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef(null);

    const fetchFocusData = async () => {
        try {
            setLoading(true);
            const [statsRes, historyRes] = await Promise.all([
                api.get('/focus/stats'),
                api.get('/focus')
            ]);
            setStats(statsRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            console.error('Failed to load focus data:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFocusData();
    }, []);

    // Timer countdown effect
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const handleSessionComplete = async () => {
        try {
            await api.post('/focus', {
                subject: subject || 'General Focus',
                topic: topic || '',
                goal: goal || '',
                mode,
                duration: durations[mode],
                seconds: durations[mode] * 60,
                status: 'Completed'
            });
            alert('🎉 Session complete! Logged to your database.');
            fetchFocusData();
            handleReset();
        } catch (err) {
            console.error('Error logging session:', err.message);
        }
    };

    const handleManualFinish = async () => {
        const elapsedSecs = totalSeconds - remainingSeconds;
        if (elapsedSecs < 10) {
            alert('Session too short to record.');
            handleReset();
            return;
        }

        const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));
        try {
            await api.post('/focus', {
                subject: subject || 'General Focus',
                topic: topic || '',
                goal: goal || '',
                mode,
                duration: elapsedMins,
                seconds: elapsedSecs,
                status: 'Completed'
            });
            fetchFocusData();
            handleReset();
        } catch (err) {
            alert('Failed to save session: ' + err.message);
        }
    };

    const handleModeChange = (newMode) => {
        if (isRunning) {
            if (!window.confirm('Timer is running. Switch mode and reset?')) return;
        }
        setIsRunning(false);
        setMode(newMode);
        const mins = durations[newMode] || 25;
        setTotalSeconds(mins * 60);
        setRemainingSeconds(mins * 60);
    };

    const handleApplyDuration = (mins) => {
        const val = parseInt(mins, 10);
        if (isNaN(val) || val < 1 || val > 180) {
            alert('Please enter a duration between 1 and 180 minutes.');
            return;
        }
        setIsRunning(false);
        setDurations({ ...durations, [mode]: val });
        setTotalSeconds(val * 60);
        setRemainingSeconds(val * 60);
    };

    const handleReset = () => {
        setIsRunning(false);
        const mins = durations[mode];
        setTotalSeconds(mins * 60);
        setRemainingSeconds(mins * 60);
    };

    const handleClearTodayHistory = async () => {
        if (!window.confirm("Delete all of today's focus history?")) return;
        try {
            await api.delete('/focus/today');
            fetchFocusData();
        } catch (err) {
            alert('Failed to clear history: ' + err.message);
        }
    };

    // Format mm:ss
    const minsLeft = Math.floor(remainingSeconds / 60);
    const secsLeft = remainingSeconds % 60;
    const timeFormatted = `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;

    return (
        <div className="focus-page-container">
            <Sidebar />

            <div className="main-content">
                {/* HEADER */}
                <header className="header">
                    <div>
                        <h1>⏱️ Focus Timer</h1>
                        <p>Track your study sessions and build your daily focus streak.</p>
                    </div>
                </header>

                {/* STATS */}
                <section className="focus-stats">
                    <div className="stat-card">
                        <span className="stat-icon blue">⏱️</span>
                        <div>
                            <p>Today's Focus Time</p>
                            <h2 id="totalFocusTime">{stats.todayMinutes} min</h2>
                            <small>Based on completed sessions</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon green">✓</span>
                        <div>
                            <p>Completed Sessions</p>
                            <h2 id="totalSessions">{stats.completedSessions}</h2>
                            <small>Today's completed sessions</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon orange">🎯</span>
                        <div>
                            <p>Daily Focus Goal</p>
                            <h2 id="goalText">{stats.currentHours} / {stats.goalHours} hrs</h2>

                            <div className="progress-bar">
                                <div id="goalProgress" style={{ width: `${stats.progress}%` }}></div>
                            </div>

                            <button
                                type="button"
                                id="changeGoalBtn"
                                className="text-btn"
                                onClick={() => {
                                    const hrs = prompt('Set daily focus goal in hours (e.g. 4):', stats.goalHours);
                                    if (hrs && !isNaN(hrs)) {
                                        api.put('/auth/profile', { dailyStudyGoal: Math.round(Number(hrs) * 60) })
                                            .then(() => fetchFocusData());
                                    }
                                }}
                            >
                                Change daily goal
                            </button>
                        </div>
                    </div>
                </section>

                {/* TIMER AND SESSION DETAILS */}
                <section className="focus-layout">
                    {/* TIMER CARD */}
                    <div className="timer-card">
                        <div className="card-heading">
                            <div>
                                <h2 id="timerHeading">
                                    {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
                                </h2>
                                <p id="timerStatus">{isRunning ? 'Session in progress...' : 'Ready when you are'}</p>
                            </div>

                            <span className="ready-badge" id="statusBadge">
                                {isRunning ? '● Running' : '● Ready'}
                            </span>
                        </div>

                        {/* MODES */}
                        <div className="timer-modes">
                            <button
                                type="button"
                                className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
                                onClick={() => handleModeChange('focus')}
                            >
                                Focus
                            </button>

                            <button
                                type="button"
                                className={`mode-btn ${mode === 'short' ? 'active' : ''}`}
                                onClick={() => handleModeChange('short')}
                            >
                                Short Break
                            </button>

                            <button
                                type="button"
                                className={`mode-btn ${mode === 'long' ? 'active' : ''}`}
                                onClick={() => handleModeChange('long')}
                            >
                                Long Break
                            </button>
                        </div>

                        {/* TIME SETTINGS */}
                        <div className="duration-settings">
                            <div>
                                <label htmlFor="durationInput">Duration (minutes)</label>
                                <input
                                    type="number"
                                    id="durationInput"
                                    min="1"
                                    max="180"
                                    value={durations[mode]}
                                    onChange={(e) => setDurations({ ...durations, [mode]: e.target.value })}
                                />
                            </div>

                            <button
                                type="button"
                                id="applyDurationBtn"
                                onClick={() => handleApplyDuration(durations[mode])}
                            >
                                Apply Time
                            </button>
                        </div>

                        {/* TIMER CIRCLE */}
                        <div className="timer-circle" id="timerCircle">
                            <div className="timer-inner">
                                <span id="timerLabel">
                                    {mode === 'focus' ? 'FOCUS TIME' : 'BREAK TIME'}
                                </span>
                                <h1 id="timerDisplay">{timeFormatted}</h1>
                                <p id="timerMessage">
                                    {isRunning ? 'Keep going!' : 'Ready to focus?'}
                                </p>
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="timer-controls">
                            <button
                                type="button"
                                id="startPauseBtn"
                                className="primary-btn"
                                onClick={() => setIsRunning(!isRunning)}
                            >
                                {isRunning ? '⏸ Pause' : '▶ Start'}
                            </button>

                            <button
                                type="button"
                                id="resetBtn"
                                className="secondary-btn"
                                onClick={handleReset}
                            >
                                ↻ Reset
                            </button>

                            <button
                                type="button"
                                id="finishBtn"
                                className="finish-btn"
                                onClick={handleManualFinish}
                            >
                                ✓ Finish
                            </button>
                        </div>

                        <p className="timer-tip">
                            💡 Focus on one thing at a time. Every minute counts.
                        </p>
                    </div>

                    {/* SESSION DETAILS */}
                    <div className="session-card">
                        <div className="card-heading">
                            <div>
                                <h2>Current Session</h2>
                                <p>Customize your focus session.</p>
                            </div>
                            <span>📖</span>
                        </div>

                        <form id="sessionForm" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="subjectInput">
                                Subject / Project / Category <span>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="subjectInput"
                                placeholder="e.g. Mathematics, College Project"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />

                            <label htmlFor="topicInput">
                                Topic / Task <span>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="topicInput"
                                placeholder="e.g. Chapter 4 Integration, Unit 2"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />

                            <label htmlFor="goalInput">
                                Session Goal <span>(Optional)</span>
                            </label>
                            <textarea
                                id="goalInput"
                                rows="3"
                                placeholder="What do you plan to finish in this session?"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            ></textarea>
                        </form>
                    </div>
                </section>

                {/* HISTORY SECTION */}
                <section className="history-section" style={{ marginTop: '30px' }}>
                    <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Today's Focus History</h2>
                        <button
                            type="button"
                            id="clearHistoryBtn"
                            className="text-btn danger"
                            onClick={handleClearTodayHistory}
                        >
                            Clear today's history
                        </button>
                    </div>

                    <div id="historyList" className="history-list">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Loading focus sessions...</p>
                        ) : history.length === 0 ? (
                            <div className="empty-history" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                <p>No completed sessions today yet.</p>
                                <small>Finish a timer session to log your progress!</small>
                            </div>
                        ) : (
                            history.map((sess) => (
                                <div key={sess._id} className="history-item">
                                    <div className="history-info">
                                        <div className="history-icon">📚</div>
                                        <div>
                                            <h3>{sess.subject || 'General Focus'}</h3>
                                            <p>{sess.topic || sess.goal || 'Focused study session'}</p>
                                        </div>
                                    </div>
                                    <div className="history-status">
                                        <strong>{sess.duration || Math.round(sess.seconds / 60)} min</strong>
                                        <span>{sess.status || 'Completed'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FocusTimerPage;
