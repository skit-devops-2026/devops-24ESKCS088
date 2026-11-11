const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    }
});

const syllabusModuleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const subjectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: [true, 'Please provide a subject name'],
            trim: true
        },
        code: {
            type: String,
            trim: true,
            default: ''
        },
        teacher: {
            type: String,
            trim: true,
            default: ''
        },
        color: {
            type: String,
            default: '#3b82f6'
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        topics: [topicSchema],
        syllabus: [syllabusModuleSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Subject', subjectSchema);
