import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage = () => {
    return (
        <div className="landing-page-wrapper">
            {/* ================= NAVBAR ================= */}
            <nav>
                <div className="logo">
                    📚 StudyPlanner
                </div>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>
                    <Link to="/signup" className="signup-btn">
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* ================= HERO SECTION ================= */}
            <section className="hero" id="home">
                <h1>
                    Study Smarter. <span>Plan Better.</span>
                </h1>

                <p>
                    StudyPlanner is your personal study companion.
                    Manage your subjects, tasks, exams, notes and
                    goals in one simple and organized place.
                </p>

                <div className="hero-buttons">
                    <Link to="/signup" className="start-btn">
                        Get Started →
                    </Link>
                    <a href="#features" className="learn-btn">
                        Explore Features
                    </a>
                </div>
            </section>

            {/* ================= MARQUEE SECTION ================= */}
            <section className="marquee-section">
                <div className="marquee">
                    <div className="feature-box">📚 Subjects</div>
                    <div className="feature-box">✅ Tasks</div>
                    <div className="feature-box">📅 Calendar</div>
                    <div className="feature-box">📝 Notes</div>
                    <div className="feature-box">🎯 Goals</div>
                    <div className="feature-box">📊 Analytics</div>
                    <div className="feature-box">📝 Exams</div>
                    <div className="feature-box">⏱️ Focus Timer</div>

                    {/* Repeated boxes for continuous marquee */}
                    <div className="feature-box">📚 Subjects</div>
                    <div className="feature-box">✅ Tasks</div>
                    <div className="feature-box">📅 Calendar</div>
                    <div className="feature-box">📝 Notes</div>
                    <div className="feature-box">🎯 Goals</div>
                    <div className="feature-box">📊 Analytics</div>
                    <div className="feature-box">📝 Exams</div>
                    <div className="feature-box">⏱️ Focus Timer</div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="section" id="features">
                <h2>Everything You Need to Study Better</h2>
                <p className="section-description">
                    Manage your complete study routine from one place.
                </p>

                <div className="features">
                    <div className="card">
                        <div className="icon">📚</div>
                        <h3>Subject Management</h3>
                        <p>Add subjects and topics and track your completion progress.</p>
                    </div>

                    <div className="card">
                        <div className="icon">✅</div>
                        <h3>Task Planner</h3>
                        <p>Create tasks, set priorities and manage deadlines.</p>
                    </div>

                    <div className="card">
                        <div className="icon">📅</div>
                        <h3>Calendar</h3>
                        <p>Manage your tasks, exams and important study dates.</p>
                    </div>

                    <div className="card">
                        <div className="icon">📝</div>
                        <h3>Notes</h3>
                        <p>Create and organize your study notes easily.</p>
                    </div>

                    <div className="card">
                        <div className="icon">🎯</div>
                        <h3>Goals</h3>
                        <p>Set study goals and track your progress.</p>
                    </div>

                    <div className="card">
                        <div className="icon">📊</div>
                        <h3>Analytics</h3>
                        <p>Check your study progress using simple charts.</p>
                    </div>

                    <div className="card">
                        <div className="icon">📝</div>
                        <h3>Exam Tracker</h3>
                        <p>Keep track of upcoming exams and preparation.</p>
                    </div>

                    <div className="card">
                        <div className="icon">⏱️</div>
                        <h3>Focus Timer</h3>
                        <p>Use the Pomodoro timer for focused study sessions.</p>
                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section className="section">
                <h2>How StudyPlanner Works</h2>
                <p className="section-description">
                    Start organizing your studies in three simple steps.
                </p>

                <div className="steps">
                    <div className="step">
                        <div className="number">1</div>
                        <h3>Plan</h3>
                        <p>Add your subjects, tasks, exams and study goals.</p>
                    </div>

                    <div className="step">
                        <div className="number">2</div>
                        <h3>Study</h3>
                        <p>Complete your tasks and use the focus timer.</p>
                    </div>

                    <div className="step">
                        <div className="number">3</div>
                        <h3>Track</h3>
                        <p>Check your progress and improve your study routine.</p>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT ================= */}
            <section className="section about" id="about">
                <h2>About StudyPlanner</h2>
                <p>
                    StudyPlanner is designed to help students organize their academic life in one place.
                    Instead of using different apps for tasks, notes, exams and goals, students can manage
                    everything from a single dashboard.
                </p>
            </section>

            {/* ================= CTA ================= */}
            <section className="cta">
                <h2>Ready to Plan Your Studies?</h2>
                <p>Start organizing your study routine today.</p>
                <Link to="/signup">
                    Create Your Account →
                </Link>
            </section>

            {/* ================= FOOTER ================= */}
            <footer>
                <div className="footer-content">
                    <div>
                        <h3>📚 StudyPlanner</h3>
                        <p>Plan your studies, stay organized and achieve your academic goals.</p>
                    </div>

                    <div>
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3>Account</h3>
                        <ul>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/signup">Sign Up</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="copyright">
                    © 2026 StudyPlanner. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
