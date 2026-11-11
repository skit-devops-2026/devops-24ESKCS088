const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Please provide an event title'],
            trim: true
        },
        date: {
            type: String,
            required: [true, 'Please provide an event date']
        },
        startTime: {
            type: String,
            default: ''
        },
        endTime: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            enum: ['Task', 'Exam', 'Study', 'Class', 'Reminder', 'Personal', 'General'],
            default: 'Study'
        },
        subject: {
            type: String,
            trim: true,
            default: ''
        },
        description: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
