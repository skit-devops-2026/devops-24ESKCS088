const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a note title'],
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'file'],
            default: 'text'
        },
        subject: {
            type: String,
            required: [true, 'Please select or enter a subject'],
            trim: true
        },
        tags: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        fileName: {
            type: String,
            default: ''
        },
        fileData: {
            type: String,
            default: ''
        },
        fileSize: {
            type: String,
            default: ''
        },
        pinned: {
            type: Boolean,
            default: false
        },
        favorite: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Note', noteSchema);
