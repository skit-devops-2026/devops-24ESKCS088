const { Task } = require('../models');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const query = {
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        };

        // Optional query filters matching task.js
        if (req.query.subject && req.query.subject !== 'all') {
            query.subject = req.query.subject;
        }
        if (req.query.priority && req.query.priority !== 'all') {
            query.priority = req.query.priority;
        }
        if (req.query.status && req.query.status !== 'all') {
            if (req.query.status === 'Completed') {
                query.$or = [{ status: 'Completed' }, { completed: true }];
            } else if (req.query.status === 'Pending') {
                query.$or = [{ status: 'Pending' }, { completed: false }];
            } else {
                query.status = req.query.status;
            }
        }
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            category,
            priority,
            status,
            date,
            dueDate,
            time,
            duration
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Please provide a task title' });
        }

        const isCompleted = status === 'Completed' || req.body.completed === true;

        const task = await Task.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            title: title.trim(),
            description: description || '',
            subject: subject || 'General',
            category: category || 'Assignment',
            priority: priority || 'Medium',
            status: isCompleted ? 'Completed' : (status || 'Pending'),
            completed: isCompleted,
            progress: isCompleted ? 100 : (req.body.progress || 0),
            date: date || new Date().toISOString().split('T')[0],
            dueDate: dueDate || null,
            time: time || '',
            duration: duration || '30 mins'
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update fields
        const updates = req.body;
        if (updates.status === 'Completed' || updates.completed === true) {
            updates.status = 'Completed';
            updates.completed = true;
            updates.progress = 100;
        } else if (updates.status === 'Pending' || updates.completed === false) {
            updates.status = 'Pending';
            updates.completed = false;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle task completed status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const newCompleted = !(task.completed || task.status === 'Completed');
        task.completed = newCompleted;
        task.status = newCompleted ? 'Completed' : 'Pending';
        task.progress = newCompleted ? 100 : 0;

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    toggleTaskStatus,
    deleteTask
};
