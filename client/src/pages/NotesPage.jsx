import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/Notes.css';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('newest');
    const [activeTab, setActiveTab] = useState('all');

    // Add Note Modal
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteSubject, setNoteSubject] = useState('');
    const [noteTags, setNoteTags] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [notesRes, subjectsRes] = await Promise.all([
                api.get('/notes'),
                api.get('/subjects')
            ]);
            setNotes(notesRes.data);
            setSubjects(subjectsRes.data);
            if (subjectsRes.data.length > 0 && !noteSubject) {
                setNoteSubject(subjectsRes.data[0].name);
            }
        } catch (err) {
            console.error('Failed to load notes data:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!noteTitle.trim() || !noteSubject.trim()) {
            alert('Please provide both note title and subject');
            return;
        }

        try {
            await api.post('/notes', {
                title: noteTitle.trim(),
                subject: noteSubject.trim(),
                tags: noteTags.trim(),
                content: noteContent.trim(),
                type: 'text'
            });

            setNoteTitle('');
            setNoteTags('');
            setNoteContent('');
            setIsPopupOpen(false);
            fetchData();
        } catch (err) {
            alert('Failed to create note: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleTogglePin = async (id, e) => {
        e.stopPropagation();
        try {
            await api.patch(`/notes/${id}/pin`);
            fetchData();
        } catch (err) {
            alert('Failed to update pin: ' + err.message);
        }
    };

    const handleToggleFavorite = async (id, e) => {
        e.stopPropagation();
        try {
            await api.patch(`/notes/${id}/favorite`);
            fetchData();
        } catch (err) {
            alert('Failed to update favorite: ' + err.message);
        }
    };

    const handleDeleteNote = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete note: ' + err.message);
        }
    };

    // Statistics
    const totalNotes = notes.length;
    const pdfNotes = notes.filter((n) => n.type === 'pdf').length;
    const docxNotes = notes.filter((n) => n.type === 'docx').length;
    const uniqueSubjectsCount = new Set(notes.map((n) => n.subject)).size;

    // Filter and Sort
    const filteredNotes = notes
        .filter((note) => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (note.tags && note.tags.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter;
            const matchesType = typeFilter === 'all' || note.type === typeFilter;

            let matchesTab = true;
            if (activeTab === 'text') matchesTab = note.type === 'text';
            else if (activeTab === 'pdf') matchesTab = note.type === 'pdf';
            else if (activeTab === 'docx') matchesTab = note.type === 'docx';
            else if (activeTab === 'pinned') matchesTab = note.pinned === true;
            else if (activeTab === 'favorite') matchesTab = note.favorite === true;

            return matchesSearch && matchesSubject && matchesType && matchesTab;
        })
        .sort((a, b) => {
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            if (sortFilter === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortFilter === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortFilter === 'name') return a.title.localeCompare(b.title);
            return 0;
        });

    return (
        <div className="notes-page-container">
            <Sidebar />

            <div className="main">
                {/* HEADER */}
                <div className="header">
                    <div>
                        <h1>My Notes</h1>
                        <p>Create and manage your study notes</p>
                    </div>

                    <button className="add-note-button" onClick={() => setIsPopupOpen(true)}>
                        + Add Note
                    </button>
                </div>

                {/* STATISTICS */}
                <div className="stats">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div>
                            <h3 id="totalNotes">{totalNotes}</h3>
                            <p>Total Notes</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div>
                            <h3 id="pdfNotes">{pdfNotes}</h3>
                            <p>PDF Files</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📘</div>
                        <div>
                            <h3 id="docxNotes">{docxNotes}</h3>
                            <p>DOCX Files</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div>
                            <h3 id="totalSubjects">{uniqueSubjectsCount}</h3>
                            <p>Subjects</p>
                        </div>
                    </div>
                </div>

                {/* SEARCH AND FILTER */}
                <div className="search-area">
                    <input
                        type="text"
                        id="searchInput"
                        placeholder="🔍 Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        id="subjectFilter"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map((sub) => (
                            <option key={sub._id} value={sub.name}>
                                {sub.name}
                            </option>
                        ))}
                    </select>

                    <select
                        id="typeFilter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="text">📝 Written Notes</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="docx">📘 DOCX</option>
                    </select>

                    <select
                        id="sortFilter"
                        value={sortFilter}
                        onChange={(e) => setSortFilter(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                {/* FILTER BUTTONS */}
                <div className="filter-buttons">
                    <button
                        className={`filter-button ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-button ${activeTab === 'text' ? 'active' : ''}`}
                        onClick={() => setActiveTab('text')}
                    >
                        📝 Notes
                    </button>
                    <button
                        className={`filter-button ${activeTab === 'pdf' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pdf')}
                    >
                        📄 PDF
                    </button>
                    <button
                        className={`filter-button ${activeTab === 'docx' ? 'active' : ''}`}
                        onClick={() => setActiveTab('docx')}
                    >
                        📘 DOCX
                    </button>
                    <button
                        className={`filter-button ${activeTab === 'pinned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pinned')}
                    >
                        📌 Pinned
                    </button>
                    <button
                        className={`filter-button ${activeTab === 'favorite' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorite')}
                    >
                        ⭐ Favorites
                    </button>
                </div>

                {/* NOTES CONTAINER */}
                <div id="notesContainer" className="notes-container">
                    {loading ? (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px' }}>
                            Loading notes from MongoDB...
                        </p>
                    ) : filteredNotes.length === 0 ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#666' }}>
                            <div style={{ fontSize: '40px' }}>📝</div>
                            <h3 style={{ marginTop: '10px' }}>No notes found</h3>
                            <p>Click "+ Add Note" to create your first note!</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <div key={note._id} className="note-card" style={{ background: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                        {note.subject}
                                    </span>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={(e) => handleTogglePin(note._id, e)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: note.pinned ? 1 : 0.4 }}
                                            title={note.pinned ? 'Unpin Note' : 'Pin Note'}
                                        >
                                            📌
                                        </button>
                                        <button
                                            onClick={(e) => handleToggleFavorite(note._id, e)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: note.favorite ? 1 : 0.4 }}
                                            title={note.favorite ? 'Remove Favorite' : 'Add Favorite'}
                                        >
                                            ⭐
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteNote(note._id, e)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                            title="Delete Note"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', marginTop: '12px', color: '#1e293b' }}>{note.title}</h3>

                                {note.content && (
                                    <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                        {note.content}
                                    </p>
                                )}

                                {note.tags && (
                                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                                        🏷️ {note.tags}
                                    </div>
                                )}

                                <div style={{ marginTop: '14px', fontSize: '11px', color: '#94a3b8' }}>
                                    📅 {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADD NOTE POPUP */}
            {isPopupOpen && (
                <div id="notePopup" className="popup" style={{ display: 'flex' }}>
                    <div className="popup-content">
                        <span className="close" onClick={() => setIsPopupOpen(false)}>
                            &times;
                        </span>

                        <h2>📝 Create Note</h2>

                        <form onSubmit={handleCreateNote}>
                            <label>Note Title *</label>
                            <input
                                type="text"
                                placeholder="Enter note title..."
                                required
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                            />

                            <label>Subject *</label>
                            <select
                                value={noteSubject}
                                onChange={(e) => setNoteSubject(e.target.value)}
                                required
                            >
                                {subjects.length > 0 ? (
                                    subjects.map((s) => (
                                        <option key={s._id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="DBMS">DBMS</option>
                                        <option value="DSA">DSA</option>
                                        <option value="Operating System">Operating System</option>
                                    </>
                                )}
                            </select>

                            <label>Tags</label>
                            <input
                                type="text"
                                placeholder="e.g. Unit 1, Important, Formula"
                                value={noteTags}
                                onChange={(e) => setNoteTags(e.target.value)}
                            />

                            <label>Note Content</label>
                            <textarea
                                rows="5"
                                placeholder="Write your notes here..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            ></textarea>

                            <button type="submit" className="save-btn" style={{ marginTop: '15px' }}>
                                Save Note
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
