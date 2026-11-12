const { FocusSession, User } = require('../models');

// @desc    Get focus session history
// @route   GET /api/focus
// @access  Private
const getFocusSessions = async (req, res) => {
    try {
        const query = {
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        };

        if (req.query.date) {
            query.date = req.query.date;
        }

        const sessions = await FocusSession.find(query).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get today's focus statistics
// @route   GET /api/focus/stats
// @access  Private
const getFocusStats = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const todaySessions = await FocusSession.find({
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ],
            $or: [
                { date: todayStr },
                { date: { $regex: todayStr } },
                {
                    createdAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lte: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            ]
        });

        const totalMinutes = todaySessions.reduce((acc, s) => {
            const mins = s.duration || Math.round((s.seconds || 0) / 60);
            return acc + mins;
        }, 0);

        const completedCount = todaySessions.filter(
            s => s.status === 'Completed' || s.completed === true
        ).length;

        const dailyGoal = req.user.dailyStudyGoal || 240; // minutes
        const goalHours = (dailyGoal / 60).toFixed(1);
        const currentHours = (totalMinutes / 60).toFixed(1);
        const progress = Math.min(Math.round((totalMinutes / dailyGoal) * 100), 100);

        res.json({
            todayMinutes: totalMinutes,
            currentHours,
            goalHours,
            completedSessions: completedCount,
            dailyGoal,
            progress,
            totalSessionsCount: todaySessions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Log a new focus session
// @route   POST /api/focus
// @access  Private
const logFocusSession = async (req, res) => {
    try {
        const { subject, topic, goal, mode, duration, seconds, status } = req.body;

        const session = await FocusSession.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            subject: subject || 'General Focus',
            topic: topic || '',
            goal: goal || '',
            mode: mode || 'focus',
            duration: Number(duration) || 25,
            seconds: Number(seconds) || (Number(duration) || 25) * 60,
            status: status || 'Completed',
            completed: status === 'Completed' || true,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5)
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Clear today's focus history
// @route   DELETE /api/focus/today
// @access  Private
const clearTodayHistory = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        await FocusSession.deleteMany({
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ],
            $or: [
                { date: todayStr },
                { date: { $regex: todayStr } },
                {
                    createdAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lte: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            ]
        });

        res.json({ message: "Today's focus history cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFocusSessions,
    getFocusStats,
    logFocusSession,
    clearTodayHistory
};
