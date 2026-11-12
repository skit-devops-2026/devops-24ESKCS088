import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/exam-tracker.css';

const ExamTrackerPage = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [examName, setExamName] = useState('');
    const [examSubject, setExamSubject] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examTime, setExamTime] = useState('');
    const [examVenue, setExamVenue] = useState('');

    // Topic Input per exam
    const [topicInputs, setTopicInputs] = useState({});

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (err) {
            console.error('Failed to load exams:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!examName.trim() || !examSubject || !examDate) {
            alert('Please fill in exam name, subject, and date.');
            return;
        }

        try {
            await api.post('/exams', {
                name: examName.trim(),
                subject: examSubject,
                date: examDate,
                time: examTime,
                venue: examVenue
            });

            setExamName('');
            setExamSubject('');
            setExamDate('');
            setExamTime('');
            setExamVenue('');
            setIsModalOpen(false);
            fetchExams();
        } catch (err) {
            alert('Failed to create exam: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/exams/${id}`);
            fetchExams();
        } catch (err) {
            alert('Failed to delete exam: ' + err.message);
        }
    };

    const handleAddTopic = async (examId) => {
        const topicText = topicInputs[examId]?.trim();
        if (!topicText) return;

        try {
            await api.post(`/exams/${examId}/topics`, { name: topicText });
            setTopicInputs({ ...topicInputs, [examId]: '' });
            fetchExams();
        } catch (err) {
            alert('Failed to add topic: ' + err.message);
        }
    };

    const handleToggleTopic = async (examId, topicId) => {
        try {
            await api.patch(`/exams/${examId}/topics/${topicId}/toggle`);
            fetchExams();
        } catch (err) {
            alert('Failed to toggle topic: ' + err.message);
        }
    };

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const totalExams = exams.length;
    let thisWeek = 0;
    let upcoming = 0;
    let completed = 0;

    exams.forEach((exam) => {
        const d = new Date(exam.date);
        d.setHours(0, 0, 0, 0);
        if (d < today) {
            completed++;
        } else {
            upcoming++;
            if (d <= sevenDaysLater) {
                thisWeek++;
            }
        }
    });

    return (
        <div className="exam-tracker-page-container">
            <Sidebar />

            <main className="main-content">
                <header className="topbar">
                    <div className="page-title">
                        <h1>Exam Tracker</h1>
                        <p>Track dates, countdowns, and revision checklists.</p>
                    </div>
                </header>

                <div className="page-body">
                    {/* Welcome section */}
                    <section className="welcome-section">
                        <div>
                            <h2>Exam Tracker 📝</h2>
                            <p>Add your exams and check off topics as you finish revising.</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span id="streakBadge" className="streak-badge">
                                🔥 3 day streak
                            </span>
                            <button
                                id="addExamButton"
                                className="add-exam-button"
                                onClick={() => setIsModalOpen(true)}
                            >
                                + Add New Exam
                            </button>
                        </div>
                    </section>

                    {/* Stat cards */}
                    <section className="stats-section">
                        <div className="stat-card">
                            <div className="stat-icon blue">📊</div>
                            <div>
                                <p>Total Exams</p>
                                <h3 id="totalExamsCount">{totalExams}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">📅</div>
                            <div>
                                <p>This Week</p>
                                <h3 id="thisWeekCount">{thisWeek}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">⏳</div>
                            <div>
                                <p>Upcoming</p>
                                <h3 id="upcomingCount">{upcoming}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div>
                                <p>Completed</p>
                                <h3 id="completedCount">{completed}</h3>
                            </div>
                        </div>
                    </section>

                    {/* Exam list section */}
                    <section id="examListSection" className="exam-list-section">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Loading exams from MongoDB...</p>
                        ) : exams.length === 0 ? (
                            <div id="emptyMessage" className="empty-message" style={{ display: 'block' }}>
                                <div className="empty-icon">🗓️</div>
                                <h3>No exams added yet</h3>
                                <p>Click "Add New Exam" to get started.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {exams.map((exam) => {
                                    const examDateObj = new Date(exam.date);
                                    examDateObj.setHours(0, 0, 0, 0);
                                    const diffTime = examDateObj.getTime() - today.getTime();
                                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    const topics = exam.topics || [];
                                    const doneCount = topics.filter((t) => t.done).length;
                                    const percent = topics.length > 0 ? Math.round((doneCount / topics.length) * 100) : 0;

                                    return (
                                        <div
                                            key={exam._id}
                                            className="exam-card"
                                            style={{
                                                background: 'white',
                                                padding: '24px',
                                                borderRadius: '14px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                        {exam.subject}
                                                    </span>
                                                    <h3 style={{ fontSize: '20px', marginTop: '10px', color: '#1e293b' }}>
                                                        {exam.name || exam.title}
                                                    </h3>
                                                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                                        📅 {typeof exam.date === 'string' ? exam.date.slice(0, 10) : new Date(exam.date).toLocaleDateString()}
                                                        {exam.time && ` • ⏰ ${exam.time}`}
                                                        {exam.venue && ` • 📍 ${exam.venue}`}
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ textAlign: 'center', background: daysLeft <= 3 ? '#fee2e2' : '#f0fdf4', padding: '10px 16px', borderRadius: '10px' }}>
                                                        <strong style={{ fontSize: '22px', color: daysLeft <= 3 ? '#b91c1c' : '#15803d' }}>
                                                            {daysLeft < 0 ? 'Passed' : daysLeft}
                                                        </strong>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                            {daysLeft < 0 ? '' : 'Days Left'}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteExam(exam._id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                                        title="Delete Exam"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Topics Checklist */}
                                            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                                                    <span>Syllabus Checklist ({doneCount}/{topics.length} completed)</span>
                                                    <span>{percent}%</span>
                                                </div>
                                                <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', background: '#4f46e5', transition: 'width 0.3s' }}></div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {topics.map((t) => (
                                                        <label
                                                            key={t._id}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                color: t.done ? '#94a3b8' : '#334155',
                                                                textDecoration: t.done ? 'line-through' : 'none'
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={t.done}
                                                                onChange={() => handleToggleTopic(exam._id, t._id)}
                                                            />
                                                            {t.name}
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Add Topic Input */}
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="+ Add topic to syllabus..."
                                                        value={topicInputs[exam._id] || ''}
                                                        onChange={(e) => setTopicInputs({ ...topicInputs, [exam._id]: e.target.value })}
                                                        style={{ flex: 1, padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddTopic(exam._id)}
                                                        style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* ADD EXAM MODAL */}
            {isModalOpen && (
                <div id="examModal" className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Exam</h2>
                            <button id="closeModalButton" className="close-button" onClick={() => setIsModalOpen(false)}>
                                ✖
                            </button>
                        </div>

                        <form id="examForm" onSubmit={handleCreateExam}>
                            <div className="form-group">
                                <label htmlFor="examName">Exam Name *</label>
                                <input
                                    type="text"
                                    id="examName"
                                    placeholder="e.g. DBMS Mid Term"
                                    required
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="examSubject">Subject *</label>
                                <select
                                    id="examSubject"
                                    required
                                    value={examSubject}
                                    onChange={(e) => setExamSubject(e.target.value)}
                                >
                                    <option value="">Select subject</option>
                                    <option value="DSA">DSA</option>
                                    <option value="Java">Java</option>
                                    <option value="DBMS">DBMS</option>
                                    <option value="Machine Learning">Machine Learning</option>
                                    <option value="Operating System">Operating System</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="examDate">Date *</label>
                                    <input
                                        type="date"
                                        id="examDate"
                                        required
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="examTime">Time</label>
                                    <input
                                        type="time"
                                        id="examTime"
                                        value={examTime}
                                        onChange={(e) => setExamTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="examVenue">Venue / Mode</label>
                                <input
                                    type="text"
                                    id="examVenue"
                                    placeholder="e.g. Room 204 or Online"
                                    value={examVenue}
                                    onChange={(e) => setExamVenue(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                Save Exam
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamTrackerPage;
