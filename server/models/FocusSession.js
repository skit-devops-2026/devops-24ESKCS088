const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userEmail: {
            type: String,
            trim: true
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
            default: 'Completed'
        },
        completed: {
            type: Boolean,
            default: true
        },
        progress: {
            type: Number,
            default: 0
        },
        priority: {
            type: String,
            default: 'Medium'
        },
        date: {
            type: mongoose.Schema.Types.Mixed, // allows String or Date
            default: () => new Date().toISOString()
        },
        time: {
            type: String,
            default: () => new Date().toTimeString().slice(0, 5) // HH:mm
        }
    },
    {
        timestamps: true,
        collection: 'focus' // maps directly to the user's existing collection in studyplanner
    }
);

focusSessionSchema.pre('save', function (next) {
    if (this.userId && !this.user) {
        this.user = this.userId;
    } else if (this.user && !this.userId) {
        this.userId = this.user;
    }
    next();
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);
