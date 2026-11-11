const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subject: {
            type: String,
            trim: true,
            default: 'General Focus'
        },
        topic: {
            type: String,
            trim: true,
            default: ''
        },
        goal: {
            type: String,
            trim: true,
            default: ''
        },
        mode: {
            type: String,
            enum: ['focus', 'short', 'long'],
            default: 'focus'
        },
        duration: {
            type: Number,
            default: 25 // in minutes
        },
        seconds: {
            type: Number,
            default: 0 // total elapsed seconds
        },
        status: {
            type: String,
            enum: ['Completed', 'Abandoned', 'In Progress'],
            default: 'Completed'
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split('T')[0] // YYYY-MM-DD
        },
        time: {
            type: String,
            default: () => new Date().toTimeString().slice(0, 5) // HH:mm
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);
