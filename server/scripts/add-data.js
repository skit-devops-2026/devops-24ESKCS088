const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const { User, Task, Subject, Exam, FocusSession, Note, CalendarEvent } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyplanner';

async function addData() {
    console.log('\n========================================');
    console.log('   ➕ ADD NEW DATA TO MONGODB (TEST)    ');
    console.log('========================================\n');
    console.log(`Connecting to: ${MONGO_URI} ...`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB!\n');

        // 1. Find user Bhawana or fallback
        let user = await User.findOne({ email: 'b240802@skit.ac.in' });
        if (!user) {
            user = await User.findOne();
        }

        if (!user) {
            console.log('Creating default user Bhawana Kumawat...');
            user = await User.create({
                name: 'Bhawana Kumawat',
                email: 'b240802@skit.ac.in',
                password: 'password123'
            });
        }

        console.log(`👤 Using User: ${user.name} (${user.email}) [ID: ${user._id}]\n`);

        // Check command-line arguments: node add-data.js "Task Title" "Subject Name"
        const customTitle = process.argv[2] || `MongoDB Test Task - ${new Date().toLocaleTimeString()}`;
        const customSubject = process.argv[3] || 'dbms';

        // 2. Insert a new Task
        const newTask = await Task.create({
            userId: user._id,
            user: user._id,
            userEmail: user.email,
            title: customTitle,
            subject: customSubject,
            description: 'Task added via test script to confirm MongoDB connection and persistence.',
            priority: 'High',
            status: 'Pending',
            completed: false,
            progress: 0,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            duration: '1 Hour'
        });

        console.log('🎉 SUCCESS! New Task inserted into MongoDB:');
        console.log('----------------------------------------');
        console.log({
            _id: newTask._id,
            title: newTask.title,
            subject: newTask.subject,
            priority: newTask.priority,
            status: newTask.status,
            dueDate: newTask.dueDate,
            createdAt: newTask.createdAt
        });
        console.log('----------------------------------------\n');

        // 3. Count total tasks now in DB
        const totalTasks = await Task.countDocuments({ userId: user._id });
        console.log(`📊 Total tasks for ${user.name} in MongoDB: ${totalTasks}`);
        console.log('\n💡 You can now run "npm run db:check -- --details" or check MongoDB Compass to see this document.');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add data:', error.message);
        process.exit(1);
    }
}

addData();
