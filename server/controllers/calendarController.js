const { CalendarEvent } = require('../models');

// @desc    Get all calendar events for user
// @route   GET /api/calendar
// @access  Private
const getEvents = async (req, res) => {
    try {
        const query = {
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        };

        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }
        if (req.query.date) {
            query.date = req.query.date;
        }

        const events = await CalendarEvent.find(query).sort({ date: 1, startTime: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create calendar event
// @route   POST /api/calendar
// @access  Private
const createEvent = async (req, res) => {
    try {
        const { title, date, startTime, endTime, category, subject, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Please provide an event title' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Please provide an event date' });
        }

        const event = await CalendarEvent.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            title: title.trim(),
            date,
            startTime: startTime || '',
            endTime: endTime || '',
            category: category || 'Study',
            subject: subject || '',
            description: description || ''
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/:id
// @access  Private
const updateEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private
const deleteEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
