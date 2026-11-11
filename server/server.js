const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (satisfies deployment specification)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'study-planner-backend',
        timestamp: new Date().toISOString(),
        commit: process.env.COMMIT_SHA || 'development'
    });
});

// API Root Status
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Study Planner REST API'
    });
});

// Routes placeholders (will be connected in Module 3)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));
// app.use('/api/subjects', require('./routes/subjectRoutes'));
// app.use('/api/notes', require('./routes/noteRoutes'));
// app.use('/api/exams', require('./routes/examRoutes'));
// app.use('/api/focus', require('./routes/focusRoutes'));
// app.use('/api/calendar', require('./routes/calendarRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Study Planner Server running on port ${PORT}`);
    });
}

module.exports = app;
