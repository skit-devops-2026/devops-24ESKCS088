import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/subject-details.css';

const SubjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTopicTitle, setNewTopicTitle] = useState('');

    const fetchSubject = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/subjects/${id}`);
            setSubject(res.data);

            // Fetch related tasks for this subject
            if (res.data?.name) {
                const tasksRes = await api.get(`/tasks?subject=${encodeURIComponent(res.data.name)}`);
                setTasks(tasksRes.data);
            }
        } catch (err) {
            console.error('Failed to load subject details:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchSubject();
    }, [id]);

    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            await api.post(`/subjects/${id}/topics`, { title: newTopicTitle.trim() });
            setNewTopicTitle('');
            fetchSubject();
        } catch (err) {
            alert('Failed to add topic: ' + err.message);
        }
    };

    const handleToggleTopic = async (topicId) => {
        try {
            await api.patch(`/subjects/${id}/topics/${topicId}/toggle`);
            fetchSubject();
        } catch (err) {
            alert('Failed to update topic: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="subject-details-container">
                <Sidebar />
                <div className="main-content" style={{ padding: '40px', textAlign: 'center' }}>
                    <p>Loading subject details...</p>
                </div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="subject-details-container">
                <Sidebar />
                <div className="main-content" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3>Subject not found</h3>
                    <button onClick={() => navigate('/subjects')} style={{ marginTop: '15px', padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        ← Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    const topics = subject.topics || [];
    const completedTopics = topics.filter(t => t.completed).length;
    const progress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : (subject.progress || 0);

    return (
        <div className="subject-details-container">
            <Sidebar />

            <div className="main-content">
                {/* Header */}
                <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <button
                            onClick={() => navigate('/subjects')}
                            style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}
                        >
                            ← Back to Subjects
                        </button>
                        <h1 style={{ fontSize: '28px', color: '#1e293b' }}>{subject.name}</h1>
                        <p style={{ color: '#64748b' }}>
                            {subject.code && <strong>{subject.code} • </strong>}
                            {subject.teacher && `Instructor: ${subject.teacher}`}
                        </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{progress}%</div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{completedTopics} of {topics.length} topics done</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '30px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#4f46e5', transition: 'width 0.3s' }}></div>
                </div>

                {/* Topics Checklist Section */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b' }}>📖 Syllabus & Topics Checklist</h2>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>{topics.length} Total</span>
                    </div>

                    {/* Add topic form */}
                    <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Add new topic or chapter (e.g. Normalization, Transactions)..."
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Add Topic
                        </button>
                    </form>

                    {topics.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No topics added yet. Add your first topic above!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {topics.map((topic) => (
                                <div
                                    key={topic._id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: topic.completed ? '#f8fafc' : '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={topic.completed}
                                        onChange={() => handleToggleTopic(topic._id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span
                                        style={{
                                            flex: 1,
                                            fontSize: '15px',
                                            color: topic.completed ? '#94a3b8' : '#1e293b',
                                            textDecoration: topic.completed ? 'line-through' : 'none'
                                        }}
                                    >
                                        {topic.title}
                                    </span>
                                    {topic.completed && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>✓ Completed</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Related Tasks */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '16px' }}>📋 Related Tasks for {subject.name}</h2>
                    {tasks.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No tasks assigned to this subject yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {tasks.map(t => (
                                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontWeight: '500' }}>{t.title}</span>
                                    <span style={{ color: t.completed ? '#10b981' : '#f59e0b', fontSize: '13px' }}>
                                        {t.completed ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectDetailsPage;
