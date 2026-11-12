import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load dashboard stats:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const greeting = 'Good Morning! 👋';
    const studentName = user?.name || stats?.user?.name || 'Student';
    const todayDate = stats?.todayDate || new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    const quote = stats?.quote || '"Success is the sum of small efforts, repeated day in and day out."';

    const tasksTotal = stats?.tasks?.total || 0;
    const tasksCompleted = stats?.tasks?.completed || 0;
    const tasksRemaining = stats?.tasks?.remaining || 0;
    const taskProgressPct = stats?.tasks?.percentage || 0;

    const subjects = stats?.subjects?.length > 0 ? stats.subjects : [
        { name: 'DBMS', progress: 80 },
        { name: 'Operating System', progress: 65 },
        { name: 'Computer Networks', progress: 50 }
    ];

    const upcomingExam = stats?.upcomingExams?.[0];

    return (
        <div className="dashboard-page-container">
            <Sidebar />

            <div className="main-content">
                {/* Header */}
                <div className="header">
                    <div>
                        <h1>{greeting}</h1>
                        <p id="todayDate">{todayDate}</p>
                    </div>

                    <div className="user-section">
                        <span className="notification">🔔</span>
                        <div className="user">
                            👤
                            <span>{studentName}</span>
                        </div>
                    </div>
                </div>

                {/* ================= QUOTE ================= */}
                <div className="quote-card">
                    <div className="quote-icon">💡</div>
                    <div>
                        <h2>Quote of the Day</h2>
                        <p id="dailyQuote">{quote}</p>
                    </div>
                </div>

                {/* ================= FIRST ROW ================= */}
                <div className="card-row">
                    {/* Today's Task Progress */}
                    <div className="dashboard-card task-progress-card">
                        <div className="card-title">
                            <h2>📋 Today's Task Progress</h2>
                            <span>{taskProgressPct}%</span>
                        </div>

                        <div className="task-number">
                            <strong id="completedTasks">{tasksCompleted}</strong>
                            <span>/ {tasksTotal} Tasks Completed</span>
                        </div>

                        <div className="progress">
                            <div
                                className="progress-bar task-bar"
                                id="taskProgress"
                                style={{ width: `${taskProgressPct}%` }}
                            ></div>
                        </div>

                        <p id="remainingTasks">
                            {tasksRemaining} tasks remaining
                        </p>

                        <Link to="/tasks" className="view-link">
                            View Tasks →
                        </Link>
                    </div>

                    {/* Subject Progress */}
                    <div className="dashboard-card">
                        <div className="card-title">
                            <h2>📚 Subject Progress</h2>
                            <Link to="/subjects">View All</Link>
                        </div>

                        {subjects.map((sub, index) => (
                            <div className="subject" key={sub._id || index}>
                                <div className="subject-info">
                                    <span>{sub.name}</span>
                                    <span>{sub.progress || 0}%</span>
                                </div>
                                <div className="progress">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${sub.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= SECOND ROW ================= */}
                <div className="card-row">
                    {/* Upcoming Exam */}
                    <div className="dashboard-card exam-card">
                        <div className="card-title">
                            <h2>📅 Upcoming Exam</h2>
                            <Link to="/exam-tracker">View All</Link>
                        </div>

                        {upcomingExam ? (
                            <div className="exam-content">
                                <div>
                                    <h3>{upcomingExam.title}</h3>
                                    <p>{upcomingExam.subject}</p>
                                    <span className="exam-date">
                                        📅 {typeof upcomingExam.date === 'string' ? upcomingExam.date.slice(0, 10) : new Date(upcomingExam.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="days-left">
                                    <strong>{upcomingExam.daysLeft}</strong>
                                    <span>Days Left</span>
                                </div>
                            </div>
                        ) : (
                            <div className="exam-content">
                                <div>
                                    <h3>FSD Practical</h3>
                                    <p>Full Stack Development</p>
                                    <span className="exam-date">📅 Upcoming</span>
                                </div>
                                <div className="days-left">
                                    <strong>7</strong>
                                    <span>Days Left</span>
                                </div>
                            </div>
                        )}

                        <Link to="/exam-tracker" className="view-button">
                            View Exam
                        </Link>
                    </div>

                    {/* High Priority Tasks */}
                    <div className="dashboard-card priority-card">
                        <div className="card-title">
                            <h2>🔥 High Priority Tasks</h2>
                            <Link to="/tasks">View All</Link>
                        </div>

                        <div className="priority-task">
                            <div className="priority-dot"></div>
                            <div>
                                <h3>Revise DBMS & DSA</h3>
                                <p>Due Tomorrow</p>
                            </div>
                        </div>

                        <div className="priority-task">
                            <div className="priority-dot"></div>
                            <div>
                                <h3>Complete MERN Stack Migration</h3>
                                <p>In Progress</p>
                            </div>
                        </div>

                        <div className="priority-task">
                            <div className="priority-dot"></div>
                            <div>
                                <h3>Prepare FSD Assignment</h3>
                                <p>High Priority</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= QUICK ACTIONS ================= */}
                <div className="quick-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/tasks" className="quick-card">
                            <span>➕</span>
                            <p>Add Task</p>
                        </Link>
                        <Link to="/notes" className="quick-card">
                            <span>📝</span>
                            <p>New Note</p>
                        </Link>
                        <Link to="/subjects" className="quick-card">
                            <span>📚</span>
                            <p>Add Subject</p>
                        </Link>
                        <Link to="/focus" className="quick-card">
                            <span>⏱️</span>
                            <p>Start Focus</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
