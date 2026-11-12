import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="logo sidebar-logo">
                📚 Study Planner
            </div>

            <div className="menu sidebar-nav">
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    🏠 Dashboard
                </NavLink>

                <NavLink 
                    to="/subjects" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    📚 Subjects
                </NavLink>

                <NavLink 
                    to="/tasks" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    ✅ Task Planner
                </NavLink>

                <NavLink 
                    to="/calendar" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    📅 Calendar
                </NavLink>

                <NavLink 
                    to="/notes" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    📝 Notes
                </NavLink>

                <NavLink 
                    to="/exam-tracker" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    📝 Exam Tracker
                </NavLink>

                <NavLink 
                    to="/focus" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    ⏱️ Focus Timer
                </NavLink>
            </div>

            <div className="bottom-menu sidebar-bottom">
                <NavLink 
                    to="/settings" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    ⚙️ Settings
                </NavLink>

                <a href="#logout" onClick={handleLogout}>
                    🚪 Logout
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
