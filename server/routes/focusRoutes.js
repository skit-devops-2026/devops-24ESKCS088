const express = require('express');
const router = express.Router();
const {
    getFocusSessions,
    getFocusStats,
    logFocusSession,
    clearTodayHistory
} = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFocusSessions)
    .post(protect, logFocusSession);

router.get('/stats', protect, getFocusStats);
router.delete('/today', protect, clearTodayHistory);

module.exports = router;
