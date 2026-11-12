import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/subjects.css';

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // Form states
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [teacherName, setTeacherName] = useState('');

    const navigate = useNavigate();

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Failed to load subjects:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!subjectName.trim()) {
            alert('Please enter a subject name');
            return;
        }

        try {
            await api.post('/subjects', {
                name: subjectName.trim(),
                code: subjectCode.trim(),
                teacher: teacherName.trim()
            });
            setSubjectName('');
            setSubjectCode('');
            setTeacherName('');
            setIsPopupOpen(false);
            fetchSubjects();
        } catch (err) {
            alert('Failed to add subject: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteSubject = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
        } catch (err) {
            alert('Failed to delete subject: ' + err.message);
        }
    };

    // Calculate metrics
    const totalSubjects = subjects.length;
    let totalTopics = 0;
    let completedTopics = 0;

    subjects.forEach((s) => {
        if (s.topics && Array.isArray(s.topics)) {
            totalTopics += s.topics.length;
            completedTopics += s.topics.filter((t) => t.completed).length;
        }
    });

    const overallProgress =
        totalTopics > 0
            ? Math.round((completedTopics / totalTopics) * 100)
            : totalSubjects > 0
            ? Math.round(
                  subjects.reduce((acc, s) => acc + (s.progress || 0), 0) /
                      totalSubjects
              )
            : 0;

    const filteredSubjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="subjects-page-container">
            <Sidebar />

            <div className="main-content">
                <div className="top-bar">
                    <div>
                        <h1>📚 Subject Management</h1>
                        <p>Manage your subjects and track your syllabus.</p>
                    </div>

                    <button className="add-btn" onClick={() => setIsPopupOpen(true)}>
                        + Add Subject
                    </button>
                </div>

                {/* Statistics */}
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div>
                            <h3 id="totalSubjects">{totalSubjects}</h3>
                            <p>Total Subjects</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📖</div>
                        <div>
                            <h3 id="totalTopics">{totalTopics}</h3>
                            <p>Total Topics</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div>
                            <h3 id="completedTopics">{completedTopics}</h3>
                            <p>Topics Completed</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div>
                            <h3 id="overallProgress">{overallProgress}%</h3>
                            <p>Overall Progress</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="search-box">
                    <input
                        type="text"
                        id="searchSubject"
                        placeholder="🔎 Search subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Subjects Grid */}
                <div id="subjectsContainer" className="subjects-container">
                    {loading ? (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px' }}>
                            Loading subjects from MongoDB...
                        </p>
                    ) : filteredSubjects.length === 0 ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#666' }}>
                            <div style={{ fontSize: '40px' }}>📚</div>
                            <h3 style={{ marginTop: '10px' }}>No subjects found</h3>
                            <p>Click "+ Add Subject" to create your first subject!</p>
                        </div>
                    ) : (
                        filteredSubjects.map((sub) => {
                            const prog = sub.progress || 0;
                            return (
                                <div
                                    key={sub._id}
                                    className="subject-card"
                                    style={{
                                        background: 'white',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/subjects/${sub._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '18px', color: '#1e293b' }}>{sub.name}</h3>
                                            {sub.code && (
                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                                                    {sub.code}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSubject(sub._id, e)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                            title="Delete Subject"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {sub.teacher && (
                                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                                            👨‍🏫 {sub.teacher}
                                        </p>
                                    )}

                                    <div style={{ marginTop: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                                            <span>Progress</span>
                                            <span>{prog}%</span>
                                        </div>
                                        <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${prog}%`,
                                                    height: '100%',
                                                    background: sub.color || '#3b82f6',
                                                    transition: 'width 0.3s'
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
                                        <span>📖 {sub.topics ? sub.topics.length : 0} Topics</span>
                                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>View Details →</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Subject Popup */}
            {isPopupOpen && (
                <div id="subjectPopup" className="popup" style={{ display: 'flex' }}>
                    <div className="popup-content">
                        <span className="close" onClick={() => setIsPopupOpen(false)}>
                            &times;
                        </span>

                        <h2>➕ Add Subject</h2>

                        <form onSubmit={handleAddSubject}>
                            <label>Subject Name *</label>
                            <input
                                type="text"
                                id="subjectName"
                                placeholder="Example: DBMS"
                                required
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                            />

                            <label>Subject Code</label>
                            <input
                                type="text"
                                id="subjectCode"
                                placeholder="Example: CS301"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                            />

                            <label>Teacher Name</label>
                            <input
                                type="text"
                                id="teacherName"
                                placeholder="Optional"
                                value={teacherName}
                                onChange={(e) => setTeacherName(e.target.value)}
                            />

                            <button type="submit" className="save-btn">
                                Add Subject
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsPage;
