const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    togglePin,
    toggleFavorite,
    deleteNote
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getNotes)
    .post(protect, createNote);

router.route('/:id')
    .get(protect, getNoteById)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

router.patch('/:id/pin', protect, togglePin);
router.patch('/:id/favorite', protect, toggleFavorite);

module.exports = router;
