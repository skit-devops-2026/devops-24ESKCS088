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

// Connect API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Serve static frontend assets in production or when client is built
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

if (process.env.NODE_ENV === 'production' || fs.existsSync(clientDistPath)) {
    if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));
    }
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health') {
            return next();
        }
        if (fs.existsSync(indexHtmlPath)) {
            return res.sendFile(indexHtmlPath);
        }
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Study Planner</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>🚀 Study Planner Server is Live!</h2>
                <p>Backend API and Health check are active.</p>
                <p><a href="/health">Check Server Health</a> | <a href="/api">API Info</a></p>
            </body>
            </html>
        `);
    });
}

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

if (require.main === module) {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Study Planner Server running on port ${PORT} bound to 0.0.0.0`);
    });
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;
}

module.exports = app;
