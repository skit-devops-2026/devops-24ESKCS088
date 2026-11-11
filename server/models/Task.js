const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        subject: {
            type: String,
            trim: true,
            default: 'General'
        },
        category: {
            type: String,
            trim: true,
            default: 'Assignment'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        date: {
            type: String,
            required: [true, 'Please provide a task date']
        },
        time: {
            type: String,
            default: ''
        },
        duration: {
            type: String,
            default: '30 mins'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema);
