import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/calendar.css';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Current Date Navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Form
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [eventCategory, setEventCategory] = useState('Study');
    const [eventSubject, setEventSubject] = useState('');
    const [eventDescription, setEventDescription] = useState('');

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/calendar');
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to load calendar events:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!eventTitle.trim() || !eventDate) {
            alert('Please provide event title and date');
            return;
        }

        try {
            await api.post('/calendar', {
                title: eventTitle.trim(),
                date: eventDate,
                startTime,
                endTime,
                category: eventCategory,
                subject: eventSubject.trim(),
                description: eventDescription.trim()
            });

            setEventTitle('');
            setEventDescription('');
            setStartTime('');
            setEndTime('');
            setIsAddModalOpen(false);
            fetchEvents();
        } catch (err) {
            alert('Failed to save event: ' + err.message);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await api.delete(`/calendar/${id}`);
            setSelectedEvent(null);
            fetchEvents();
        } catch (err) {
            alert('Failed to delete event: ' + err.message);
        }
    };

    // Calendar Navigation Helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    // Generate Month Days (Monday start)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendarCells = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        calendarCells.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            dateKey: `${year}-${String(month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
        });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
        calendarCells.push({
            day,
            isCurrentMonth: true,
            dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        });
    }

    // Next month filler days to complete 35 or 42 cells
    const remaining = (7 - (calendarCells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
        calendarCells.push({
            day,
            isCurrentMonth: false,
            dateKey: `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        });
    }

    // Filter events
    const visibleEvents = events.filter((ev) =>
        categoryFilter === 'All' ? true : ev.category === categoryFilter
    );

    const getEventsForDate = (dateKey) => {
        return visibleEvents.filter((ev) => ev.date === dateKey);
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // Stats
    const monthEventsCount = events.filter((ev) => ev.date && ev.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
    const monthTasksCount = events.filter((ev) => ev.category === 'Task' && ev.date && ev.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
    const upcomingExamsCount = events.filter((ev) => ev.category === 'Exam' && ev.date >= todayStr).length;

    // Upcoming events sorted
    const upcomingList = [...visibleEvents]
        .filter((ev) => ev.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    return (
        <div className="calendar-page-container">
            <Sidebar />

            <div className="main-content">
                {/* HEADER */}
                <header className="header">
                    <div>
                        <h1>📅 Calendar & Schedule</h1>
                        <p>View your study sessions, tasks, and exam dates.</p>
                    </div>

                    <button
                        id="addEventBtn"
                        className="add-event-btn"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + Add Event
                    </button>
                </header>

                {/* STATISTICS */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon purple-icon">📅</div>
                        <div>
                            <p>Events This Month</p>
                            <h2 id="totalEvents">{monthEventsCount}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange-icon">📝</div>
                        <div>
                            <p>Tasks This Month</p>
                            <h2 id="totalTasks">{monthTasksCount}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon red-icon">📚</div>
                        <div>
                            <p>Upcoming Exams</p>
                            <h2 id="totalExams">{upcomingExamsCount}</h2>
                        </div>
                    </div>
                </section>

                {/* CALENDAR & UPCOMING SECTION */}
                <section className="calendar-layout">
                    {/* CALENDAR CARD */}
                    <div className="calendar-card">
                        <div className="calendar-toolbar">
                            <div className="month-navigation">
                                <button id="prevMonthBtn" className="nav-btn" onClick={prevMonth}>
                                    &#10094;
                                </button>
                                <h2 id="monthYear">{monthNames[month]} {year}</h2>
                                <button id="nextMonthBtn" className="nav-btn" onClick={nextMonth}>
                                    &#10095;
                                </button>
                            </div>

                            <button id="todayBtn" className="today-btn" onClick={goToday}>
                                Today
                            </button>
                        </div>

                        {/* CONTROLS */}
                        <div className="calendar-controls">
                            <select
                                id="categoryFilter"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Task">Tasks</option>
                                <option value="Exam">Exams</option>
                                <option value="Study">Study</option>
                                <option value="Personal">Personal</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* CALENDAR GRID */}
                        <div className="calendar-grid">
                            <div className="weekdays">
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                                <div>Sun</div>
                            </div>

                            <div id="calendarDays" className="calendar-days">
                                {calendarCells.map((cell, index) => {
                                    const dayEvents = getEventsForDate(cell.dateKey);
                                    const isToday = cell.dateKey === todayStr;

                                    return (
                                        <div
                                            key={index}
                                            className={`calendar-day ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                            onClick={() => {
                                                setEventDate(cell.dateKey);
                                                setIsAddModalOpen(true);
                                            }}
                                            style={{ minHeight: '90px', padding: '6px', cursor: 'pointer' }}
                                        >
                                            <div className="day-number" style={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                                                {cell.day}
                                            </div>

                                            <div className="day-events" style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                                                {dayEvents.slice(0, 3).map((ev) => (
                                                    <div
                                                        key={ev._id}
                                                        className={`event-chip category-${(ev.category || 'study').toLowerCase()}`}
                                                        style={{
                                                            fontSize: '11px',
                                                            padding: '2px 5px',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(ev);
                                                        }}
                                                    >
                                                        {ev.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                                                        +{dayEvents.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CATEGORY LEGEND */}
                        <div className="category-legend">
                            <span><i className="dot task-dot"></i> Tasks</span>
                            <span><i className="dot exam-dot"></i> Exams</span>
                            <span><i className="dot study-dot"></i> Study</span>
                            <span><i className="dot personal-dot"></i> Personal</span>
                            <span><i className="dot other-dot"></i> Other</span>
                        </div>
                    </div>

                    {/* UPCOMING EVENTS ASIDE */}
                    <aside className="upcoming-card">
                        <div className="upcoming-heading">
                            <div>
                                <h2>Upcoming Events</h2>
                                <p>Your next scheduled activities</p>
                            </div>
                            <span>📌</span>
                        </div>

                        <div id="upcomingEvents" className="upcoming-events-list">
                            {upcomingList.length === 0 ? (
                                <div className="no-upcoming" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                                    <div style={{ fontSize: '30px' }}>📅</div>
                                    <p>No upcoming events.</p>
                                    <p style={{ fontSize: '12px' }}>Click "+ Add Event" to plan your schedule.</p>
                                </div>
                            ) : (
                                upcomingList.map((ev) => (
                                    <div
                                        key={ev._id}
                                        className="upcoming-item"
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: '#f8fafc',
                                            marginBottom: '10px',
                                            borderLeft: '4px solid #4f46e5'
                                        }}
                                        onClick={() => setSelectedEvent(ev)}
                                    >
                                        <h4 style={{ fontSize: '15px', color: '#1e293b' }}>{ev.title}</h4>
                                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            📅 {ev.date} {ev.startTime && `• ⏰ ${ev.startTime}`}
                                        </p>
                                        <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                            {ev.category}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                </section>
            </div>

            {/* ADD EVENT MODAL */}
            {isAddModalOpen && (
                <div id="eventModal" className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Event</h2>
                            <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent}>
                            <div className="form-group">
                                <label>Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. DBMS Revision Session"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={eventCategory}
                                        onChange={(e) => setEventCategory(e.target.value)}
                                    >
                                        <option value="Study">Study</option>
                                        <option value="Task">Task</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Subject / Course</label>
                                <input
                                    type="text"
                                    placeholder="e.g. DBMS"
                                    value={eventSubject}
                                    onChange={(e) => setEventSubject(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Add any notes or location details..."
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EVENT DETAILS POPUP */}
            {selectedEvent && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedEvent.title}</h2>
                            <button className="close-btn" onClick={() => setSelectedEvent(null)}>
                                ✕
                            </button>
                        </div>
                        <div style={{ padding: '15px 0' }}>
                            <p><strong>Category:</strong> {selectedEvent.category}</p>
                            <p><strong>Date:</strong> {selectedEvent.date}</p>
                            {selectedEvent.startTime && <p><strong>Time:</strong> {selectedEvent.startTime} {selectedEvent.endTime && `- ${selectedEvent.endTime}`}</p>}
                            {selectedEvent.subject && <p><strong>Subject:</strong> {selectedEvent.subject}</p>}
                            {selectedEvent.description && <p style={{ marginTop: '10px', color: '#555' }}>{selectedEvent.description}</p>}
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                                onClick={() => handleDeleteEvent(selectedEvent._id)}
                            >
                                Delete Event
                            </button>
                            <button type="button" className="btn-primary" onClick={() => setSelectedEvent(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
