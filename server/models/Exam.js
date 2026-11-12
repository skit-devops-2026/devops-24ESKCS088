const mongoose = require('mongoose');

const examTopicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    done: {
        type: Boolean,
        default: false
    }
});

const examSchema = new mongoose.Schema(
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
        name: {
            type: String,
            trim: true
        },
        title: {
            type: String,
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Please provide the exam subject'],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        priority: {
            type: String,
            default: 'Medium'
        },
        completed: {
            type: Boolean,
            default: false
        },
        progress: {
            type: Number,
            default: 0
        },
        date: {
            type: mongoose.Schema.Types.Mixed, // allows String or Date
            required: [true, 'Please provide the exam date']
        },
        time: {
            type: String,
            default: ''
        },
        venue: {
            type: String,
            default: ''
        },
        topics: [examTopicSchema],
        confidence: {
            type: Number,
            min: 1,
            max: 10,
            default: 5
        },
        celebrated: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

examSchema.pre('save', function (next) {
    if (this.userId && !this.user) {
        this.user = this.userId;
    } else if (this.user && !this.userId) {
        this.userId = this.user;
    }
    if (!this.name && this.title) {
        this.name = this.title;
    } else if (!this.title && this.name) {
        this.title = this.name;
    }
    next();
});

module.exports = mongoose.model('Exam', examSchema);
