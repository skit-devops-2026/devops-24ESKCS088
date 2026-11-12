const express = require('express');
const router = express.Router();
const {
    getSubjects,
    createSubject,
    getSubjectById,
    updateSubject,
    deleteSubject,
    addTopic,
    toggleTopic
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSubjects)
    .post(protect, createSubject);

router.route('/:id')
    .get(protect, getSubjectById)
    .put(protect, updateSubject)
    .delete(protect, deleteSubject);

router.post('/:id/topics', protect, addTopic);
router.patch('/:id/topics/:topicId/toggle', protect, toggleTopic);

module.exports = router;
