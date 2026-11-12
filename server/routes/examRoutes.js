const express = require('express');
const router = express.Router();
const {
    getExams,
    createExam,
    getExamById,
    updateExam,
    deleteExam,
    addExamTopic,
    toggleExamTopic
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExams)
    .post(protect, createExam);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, updateExam)
    .delete(protect, deleteExam);

router.post('/:id/topics', protect, addExamTopic);
router.patch('/:id/topics/:topicId/toggle', protect, toggleExamTopic);

module.exports = router;
