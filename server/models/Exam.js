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
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: [true, 'Please provide an exam name'],
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Please provide the exam subject'],
            trim: true
        },
        date: {
            type: String,
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

module.exports = mongoose.model('Exam', examSchema);
