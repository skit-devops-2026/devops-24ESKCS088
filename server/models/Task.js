const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
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
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
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
            type: String,
            default: () => new Date().toISOString().split('T')[0]
        },
        dueDate: {
            type: Date
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

// Pre-save middleware to keep user/userId and completed/status in sync
taskSchema.pre('save', function (next) {
    if (this.userId && !this.user) {
        this.user = this.userId;
    } else if (this.user && !this.userId) {
        this.userId = this.user;
    }

    if (this.completed && this.status !== 'Completed') {
        this.status = 'Completed';
    } else if (this.status === 'Completed' && !this.completed) {
        this.completed = true;
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);
