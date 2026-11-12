const { Subject } = require('../models');

// @desc    Get all subjects for user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        }).sort({ createdAt: -1 });

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
    try {
        const { name, code, teacher, description, priority, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Please provide a subject name' });
        }

        const subject = await Subject.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            name: name.trim(),
            code: code || '',
            teacher: teacher || '',
            description: description || '',
            priority: priority || 'Medium',
            color: color || '#3b82f6',
            progress: 0,
            topics: [],
            syllabus: []
        });

        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single subject with details
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Add a topic to subject
// @route   POST /api/subjects/:id/topics
// @access  Private
const addTopic = async (req, res) => {
    try {
        const { title, notes } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Topic title is required' });
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        subject.topics.push({
            title: title.trim(),
            notes: notes || '',
            completed: false
        });

        // Recalculate progress
        const total = subject.topics.length;
        const completed = subject.topics.filter(t => t.completed).length;
        subject.progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle topic completion
// @route   PATCH /api/subjects/:id/topics/:topicId/toggle
// @access  Private
const toggleTopic = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const topic = subject.topics.id(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        topic.completed = !topic.completed;

        // Recalculate progress
        const total = subject.topics.length;
        const completed = subject.topics.filter(t => t.completed).length;
        subject.progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        await subject.save();
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    getSubjectById,
    updateSubject,
    deleteSubject,
    addTopic,
    toggleTopic
};
