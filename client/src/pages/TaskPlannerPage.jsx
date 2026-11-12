import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/task.css';

const TaskPlannerPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: 'DSA',
        category: 'Assignment',
        priority: 'Medium',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: '30 mins'
    });

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const openAddModal = () => {
        setEditingTaskId(null);
        setFormData({
            title: '',
            description: '',
            subject: 'DSA',
            category: 'Assignment',
            priority: 'Medium',
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            time: '',
            duration: '30 mins'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTaskId(task._id);
        setFormData({
            title: task.title,
            description: task.description || '',
            subject: task.subject || 'DSA',
            category: task.category || 'Assignment',
            priority: task.priority || 'Medium',
            status: task.status || 'Pending',
            date: task.date || (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            time: task.time || '',
            duration: task.duration || '30 mins'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTaskId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTaskId) {
                await api.put(`/tasks/${editingTaskId}`, formData);
            } else {
                await api.post('/tasks', formData);
            }
            closeModal();
            fetchTasks();
        } catch (err) {
            alert('Failed to save task: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            await api.patch(`/tasks/${taskId}/toggle`);
            fetchTasks();
        } catch (err) {
            alert('Error toggling task: ' + err.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks();
        } catch (err) {
            alert('Error deleting task: ' + err.message);
        }
    };

    // Calculate Statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed || t.status === 'Completed').length;
    const progressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => (!t.completed && t.status !== 'Completed' && t.status !== 'In Progress')).length;

    const overdueTasks = tasks.filter(t => {
        if (t.completed || t.status === 'Completed') return false;
        const taskDate = new Date(t.date || t.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today;
    }).length;

    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Filter Tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSubject = subjectFilter === 'all' || task.subject === subjectFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'Completed' ? (task.completed || task.status === 'Completed') :
             statusFilter === 'Pending' ? (!task.completed && task.status === 'Pending') :
             task.status === statusFilter);

        return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
    });

    return (
        <div className="task-page-container">
            <Sidebar />

            <div className="main-content">
                {/* TOP BAR */}
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="page-title">
                            <h1>Task Planner</h1>
                            <p>Organize your study tasks and stay productive.</p>
                        </div>
                    </div>
                </header>

                <section className="content">
                    {/* WELCOME */}
                    <div className="welcome-section">
                        <div>
                            <h2>Good Evening 👋</h2>
                            <p>Let's complete your study goals today.</p>
                        </div>
                        <button
                            id="addTaskButton"
                            className="add-task-button"
                            onClick={openAddModal}
                        >
                            + Add New Task
                        </button>
                    </div>

                    {/* STATISTICS */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">📋</div>
                            <div>
                                <p>Total Tasks</p>
                                <h3 id="totalTasks">{totalTasks}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">⏳</div>
                            <div>
                                <p>Pending</p>
                                <h3 id="pendingTasks">{pendingTasks}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">🔄</div>
                            <div>
                                <p>In Progress</p>
                                <h3 id="progressTasks">{progressTasks}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div>
                                <p>Completed</p>
                                <h3 id="completedTasks">{completedTasks}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon red">⚠️</div>
                            <div>
                                <p>Overdue</p>
                                <h3 id="overdueTasks">{overdueTasks}</h3>
                            </div>
                        </div>
                    </div>

                    {/* DAILY PROGRESS */}
                    <div className="progress-box">
                        <div className="progress-heading">
                            <div>
                                <h3>Today's Progress</h3>
                                <p id="progressText">
                                    {completedTasks} of {totalTasks} tasks completed
                                </p>
                            </div>
                            <strong id="progressPercent">{progressPercent}%</strong>
                        </div>

                        <div className="progress-background">
                            <div
                                id="progressBar"
                                className="progress-bar"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* SEARCH & FILTERS */}
                    <div className="filter-box">
                        <div className="search-box">
                            <span>🔍</span>
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            id="subjectFilter"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <option value="all">All Subjects</option>
                            <option value="DSA">DSA</option>
                            <option value="Java">Java</option>
                            <option value="DBMS">DBMS</option>
                            <option value="dbms">dbms</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Operating System">Operating System</option>
                        </select>

                        <select
                            id="priorityFilter"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* TASK CONTAINER */}
                    <div id="taskContainer" className="task-container" style={{ marginTop: '20px' }}>
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Loading tasks from MongoDB...</p>
                        ) : filteredTasks.length === 0 ? (
                            <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                <span style={{ fontSize: '40px' }}>📋</span>
                                <h3 style={{ marginTop: '10px' }}>No tasks found</h3>
                                <p style={{ color: '#888' }}>Click "+ Add New Task" to create one!</p>
                            </div>
                        ) : (
                            <div className="task-list-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {filteredTasks.map(task => {
                                    const isDone = task.completed || task.status === 'Completed';
                                    return (
                                        <div
                                            key={task._id}
                                            className={`task-card ${isDone ? 'task-completed' : ''}`}
                                            style={{
                                                background: 'white',
                                                padding: '18px',
                                                borderRadius: '12px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderLeft: task.priority === 'High' ? '4px solid #ef4444' : task.priority === 'Medium' ? '4px solid #f59e0b' : '4px solid #10b981'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isDone}
                                                    onChange={() => handleToggleTask(task._id)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <div>
                                                    <h4 style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#999' : '#1f2937', fontSize: '16px' }}>
                                                        {task.title}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                                                        <span>📚 {task.subject}</span>
                                                        <span>🏷️ {task.category || 'Assignment'}</span>
                                                        <span>📅 {task.date || (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'Today')}</span>
                                                        {task.duration && <span>⏱️ {task.duration}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className={`priority-badge priority-${(task.priority || 'medium').toLowerCase()}`} style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#d1fae5',
                                                    color: task.priority === 'High' ? '#b91c1c' : task.priority === 'Medium' ? '#b45309' : '#047857'
                                                }}>
                                                    {task.priority || 'Medium'}
                                                </span>

                                                <button
                                                    onClick={() => openEditModal(task)}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                                    title="Edit Task"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                                    title="Delete Task"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ADD/EDIT TASK MODAL */}
            {isModalOpen && (
                <div id="taskModal" className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 id="modalTitle">{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
                            <button id="closeModal" className="close-btn" onClick={closeModal}>
                                ✕
                            </button>
                        </div>

                        <form id="taskForm" onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Task Title *</label>
                                <input
                                    type="text"
                                    id="taskTitle"
                                    required
                                    placeholder="e.g. Complete DBMS Assignment"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    id="taskDescription"
                                    rows="3"
                                    placeholder="Add details about your task..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select
                                        id="taskSubject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="DSA">DSA</option>
                                        <option value="Java">Java</option>
                                        <option value="DBMS">DBMS</option>
                                        <option value="dbms">dbms</option>
                                        <option value="Machine Learning">Machine Learning</option>
                                        <option value="Operating System">Operating System</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        id="taskCategory"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Assignment">Assignment</option>
                                        <option value="Revision">Revision</option>
                                        <option value="Practice">Practice</option>
                                        <option value="Lecture">Lecture</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        id="taskPriority"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        id="taskStatus"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        id="taskDate"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Duration</label>
                                    <select
                                        id="taskDuration"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    >
                                        <option value="15 mins">15 mins</option>
                                        <option value="30 mins">30 mins</option>
                                        <option value="45 mins">45 mins</option>
                                        <option value="1 Hour">1 Hour</option>
                                        <option value="2 Hours">2 Hours</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" id="cancelButton" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingTaskId ? 'Update Task' : 'Save Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskPlannerPage;
