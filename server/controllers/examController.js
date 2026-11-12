const { Exam } = require('../models');

// @desc    Get all exams for user
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
    try {
        const exams = await Exam.find({
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        }).sort({ date: 1 });

        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private
const createExam = async (req, res) => {
    try {
        const { name, title, subject, date, time, venue, confidence, topics } = req.body;

        const examName = name || title;
        if (!examName) {
            return res.status(400).json({ error: 'Please provide an exam name' });
        }
        if (!subject) {
            return res.status(400).json({ error: 'Please provide an exam subject' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Please provide an exam date' });
        }

        const exam = await Exam.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            name: examName.trim(),
            title: examName.trim(),
            subject: subject.trim(),
            date,
            time: time || '',
            venue: venue || '',
            confidence: confidence || 5,
            topics: topics || [],
            celebrated: false
        });

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private
const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json({ message: 'Exam deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Add topic to exam
// @route   POST /api/exams/:id/topics
// @access  Private
const addExamTopic = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Topic name is required' });
        }

        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        exam.topics.push({
            name: name.trim(),
            done: false
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle exam topic done status
// @route   PATCH /api/exams/:id/topics/:topicId/toggle
// @access  Private
const toggleExamTopic = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        const topic = exam.topics.id(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        topic.done = !topic.done;
        await exam.save();
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getExams,
    createExam,
    getExamById,
    updateExam,
    deleteExam,
    addExamTopic,
    toggleExamTopic
};
