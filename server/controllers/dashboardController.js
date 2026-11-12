const { Task, Subject, Exam, Note, FocusSession } = require('../models');

const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Focus on progress, not perfection.",
    "Study hard, for the well is deep, and our brains are shallow.",
    "Discipline is choosing between what you want now and what you want most."
];

// @desc    Get aggregated dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userFilter = {
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        };

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Tasks
        const allTasks = await Task.find(userFilter);
        const todayTasks = allTasks.filter(t => t.date === todayStr || (t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === todayStr));
        const activeTasks = todayTasks.length > 0 ? todayTasks : allTasks;

        const totalTasksCount = activeTasks.length;
        const completedTasksCount = activeTasks.filter(t => t.completed || t.status === 'Completed').length;
        const remainingTasksCount = Math.max(0, totalTasksCount - completedTasksCount);
        const taskPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

        // 2. Subjects with progress
        const subjects = await Subject.find(userFilter).select('name code color progress topics').limit(5);

        // 3. Upcoming exams
        const allExams = await Exam.find(userFilter).sort({ date: 1 });
        const upcomingExams = allExams.map(exam => {
            const examDate = new Date(exam.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = examDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                _id: exam._id,
                title: exam.title || exam.name,
                subject: exam.subject,
                date: exam.date,
                daysLeft: Math.max(0, daysLeft),
                confidence: exam.confidence || 5,
                topicsCount: exam.topics ? exam.topics.length : 0,
                completedTopicsCount: exam.topics ? exam.topics.filter(t => t.done).length : 0
            };
        });

        // 4. Focus stats for today
        const focusSessions = await FocusSession.find({
            ...userFilter,
            $or: [
                { date: todayStr },
                {
                    createdAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lte: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            ]
        });
        const todayFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || Math.round((s.seconds || 0) / 60)), 0);

        // 5. Notes count
        const totalNotesCount = await Note.countDocuments(userFilter);

        // 6. Daily quote
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quote = quotes[dayOfYear % quotes.length];

        res.json({
            user: {
                name: req.user.name,
                email: req.user.email,
                avatar: req.user.avatar
            },
            quote,
            todayDate: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            tasks: {
                total: totalTasksCount,
                completed: completedTasksCount,
                remaining: remainingTasksCount,
                percentage: taskPercentage
            },
            subjects,
            upcomingExams: upcomingExams.slice(0, 3),
            focus: {
                todayMinutes: todayFocusMinutes,
                todayHours: (todayFocusMinutes / 60).toFixed(1)
            },
            notes: {
                total: totalNotesCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
