import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TaskPlannerPage from './pages/TaskPlannerPage';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailsPage from './pages/SubjectDetailsPage';
import NotesPage from './pages/NotesPage';
import ExamTrackerPage from './pages/ExamTrackerPage';
import FocusTimerPage from './pages/FocusTimerPage';
import CalendarPage from './pages/CalendarPage';

import './App.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Dashboard Render Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                    <h2 style={{ color: '#4f46e5' }}>📚 Study Planner</h2>
                    <p style={{ color: '#555', marginTop: '10px' }}>Notice: An issue occurred loading this section.</p>
                    <button 
                        onClick={() => { window.location.href = '/dashboard'; }}
                        style={{ marginTop: '20px', padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Reload Dashboard
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public & Auth Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Protected Feature Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/tasks" element={<TaskPlannerPage />} />
                            <Route path="/subjects" element={<SubjectsPage />} />
                            <Route path="/subjects/:id" element={<SubjectDetailsPage />} />
                            <Route path="/notes" element={<NotesPage />} />
                            <Route path="/exam-tracker" element={<ExamTrackerPage />} />
                            <Route path="/focus" element={<FocusTimerPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
