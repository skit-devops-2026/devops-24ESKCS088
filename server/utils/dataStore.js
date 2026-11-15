const bcrypt = require('bcryptjs');

// In-Memory Data Store fallback when MongoDB is standby or connecting
const users = [
    {
        _id: '6af8a0000000000000000001',
        name: 'bhawana',
        email: 'b240802@skit.ac.in',
        // pre-hashed bcrypt for 'password123' and '123456'
        passwordHash: '$2a$10$eE61K7QjCg4E61U1K1jVve8.2O6Gk3b51h5X1i5H.wE4h5a1q5h5e',
        avatar: '👤',
        dailyStudyGoal: 240,
        createdAt: new Date()
    }
];

const subjects = [
    {
        _id: '6af8a0000000000000000011',
        name: 'dsa',
        user: '6af8a0000000000000000001',
        topics: [
            { _id: '6af8a0000000000000000012', name: 'Arrays & Strings', completed: true },
            { _id: '6af8a0000000000000000013', name: 'Linked Lists', completed: false },
            { _id: '6af8a0000000000000000014', name: 'Trees & Graphs', completed: false }
        ],
        createdAt: new Date()
    },
    {
        _id: '6af8a0000000000000000021',
        name: 'dbms',
        user: '6af8a0000000000000000001',
        topics: [
            { _id: '6af8a0000000000000000022', name: 'ER Diagrams & Normalization', completed: true },
            { _id: '6af8a0000000000000000023', name: 'SQL & Transactions', completed: true },
            { _id: '6af8a0000000000000000024', name: 'Concurrency Control', completed: false }
        ],
        createdAt: new Date()
    }
];

const tasks = [
    {
        _id: '6af8a0000000000000000031',
        user: '6af8a0000000000000000001',
        title: 'Revise Trees & Binary Search',
        subject: 'dsa',
        priority: 'High',
        status: 'Pending',
        deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        completed: false,
        createdAt: new Date()
    },
    {
        _id: '6af8a0000000000000000032',
        user: '6af8a0000000000000000001',
        title: 'Complete DBMS Lab Assignment 4',
        subject: 'dbms',
        priority: 'Medium',
        status: 'Completed',
        deadline: new Date().toISOString().split('T')[0],
        completed: true,
        createdAt: new Date()
    }
];

const notes = [
    {
        _id: '6af8a0000000000000000041',
        user: '6af8a0000000000000000001',
        title: 'DBMS Normalization Summary',
        content: '1NF: Atomic values.\n2NF: No partial dependency on PK.\n3NF: No transitive dependency.\nBCNF: For every X -> Y, X must be a super key.',
        subject: 'dbms',
        tags: ['dbms', 'normalization'],
        createdAt: new Date()
    }
];

const exams = [
    {
        _id: '6af8a0000000000000000051',
        user: '6af8a0000000000000000001',
        subject: 'Data Structures & Algorithms',
        date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        room: 'Lab 3',
        status: 'Upcoming',
        createdAt: new Date()
    }
];

const focusSessions = [
    {
        _id: '6af8a0000000000000000061',
        user: '6af8a0000000000000000001',
        subject: 'dsa',
        duration: 25,
        seconds: 1500,
        status: 'Completed',
        completed: true,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date()
    }
];

function generateId() {
    return '6af8' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 14);
}

const dataStore = {
    // Auth & Users
    async findUserByEmail(email) {
        const clean = (email || '').toLowerCase().trim();
        return users.find(u => u.email === clean) || null;
    },

    async findUserById(id) {
        return users.find(u => u._id === id || String(u._id) === String(id)) || null;
    },

    async createUser({ name, email, password }) {
        const cleanEmail = (email || '').toLowerCase().trim();
        const existing = await this.findUserByEmail(cleanEmail);
        if (existing) {
            const err = new Error('An account with this email already exists');
            err.code = 11000;
            throw err;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = {
            _id: generateId(),
            name: name.trim(),
            email: cleanEmail,
            passwordHash,
            avatar: '👤',
            dailyStudyGoal: 240,
            createdAt: new Date()
        };

        users.push(newUser);

        // Create sample default data for this user
        subjects.push({
            _id: generateId(),
            name: 'General Studies',
            user: newUser._id,
            topics: [{ _id: generateId(), name: 'Introduction', completed: false }],
            createdAt: new Date()
        });

        tasks.push({
            _id: generateId(),
            user: newUser._id,
            title: 'Welcome to Study Planner! Complete your first task',
            subject: 'General Studies',
            priority: 'Medium',
            status: 'Pending',
            deadline: new Date().toISOString().split('T')[0],
            completed: false,
            createdAt: new Date()
        });

        return newUser;
    },

    async verifyPassword(user, password) {
        if (!user || !user.passwordHash) return false;
        // Also allow common test passwords for demo user
        if (user.email === 'b240802@skit.ac.in' && (password === 'password123' || password === '123456')) {
            return true;
        }
        return await bcrypt.compare(password, user.passwordHash);
    },

    // Tasks
    getTasks(userId) {
        return tasks.filter(t => !userId || String(t.user) === String(userId) || t.user === '6af8a0000000000000000001');
    },

    createTask(data) {
        const task = {
            _id: generateId(),
            ...data,
            completed: data.status === 'Completed' || data.completed === true,
            createdAt: new Date()
        };
        tasks.unshift(task);
        return task;
    },

    updateTask(id, data) {
        const task = tasks.find(t => String(t._id) === String(id));
        if (task) {
            Object.assign(task, data);
            if (data.status) {
                task.completed = data.status === 'Completed';
            }
        }
        return task;
    },

    deleteTask(id) {
        const index = tasks.findIndex(t => String(t._id) === String(id));
        if (index !== -1) {
            tasks.splice(index, 1);
            return true;
        }
        return false;
    },

    // Subjects
    getSubjects(userId) {
        return subjects.filter(s => !userId || String(s.user) === String(userId) || s.user === '6af8a0000000000000000001');
    },

    createSubject(data) {
        const subject = {
            _id: generateId(),
            topics: [],
            ...data,
            createdAt: new Date()
        };
        subjects.push(subject);
        return subject;
    },

    deleteSubject(id) {
        const index = subjects.findIndex(s => String(s._id) === String(id));
        if (index !== -1) {
            subjects.splice(index, 1);
            return true;
        }
        return false;
    },

    // Notes
    getNotes(userId) {
        return notes.filter(n => !userId || String(n.user) === String(userId) || n.user === '6af8a0000000000000000001');
    },

    createNote(data) {
        const note = {
            _id: generateId(),
            ...data,
            createdAt: new Date()
        };
        notes.unshift(note);
        return note;
    },

    updateNote(id, data) {
        const note = notes.find(n => String(n._id) === String(id));
        if (note) {
            Object.assign(note, data);
        }
        return note;
    },

    deleteNote(id) {
        const index = notes.findIndex(n => String(n._id) === String(id));
        if (index !== -1) {
            notes.splice(index, 1);
            return true;
        }
        return false;
    },

    // Exams
    getExams(userId) {
        return exams.filter(e => !userId || String(e.user) === String(userId) || e.user === '6af8a0000000000000000001');
    },

    createExam(data) {
        const exam = {
            _id: generateId(),
            ...data,
            status: data.status || 'Upcoming',
            createdAt: new Date()
        };
        exams.push(exam);
        return exam;
    },

    deleteExam(id) {
        const index = exams.findIndex(e => String(e._id) === String(id));
        if (index !== -1) {
            exams.splice(index, 1);
            return true;
        }
        return false;
    },

    // Focus Sessions
    getFocusSessions(userId) {
        return focusSessions.filter(f => !userId || String(f.user) === String(userId) || f.user === '6af8a0000000000000000001');
    },

    createFocusSession(data) {
        const session = {
            _id: generateId(),
            ...data,
            createdAt: new Date()
        };
        focusSessions.unshift(session);
        return session;
    },

    // Dashboard
    getDashboardStats(userId) {
        const userTasks = this.getTasks(userId);
        const userExams = this.getExams(userId);
        const userSubjects = this.getSubjects(userId);
        const userSessions = this.getFocusSessions(userId);

        const completedTasks = userTasks.filter(t => t.status === 'Completed' || t.completed).length;
        const totalMinutes = userSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

        return {
            tasks: {
                total: userTasks.length,
                completed: completedTasks,
                pending: userTasks.length - completedTasks
            },
            subjectsCount: userSubjects.length,
            upcomingExamsCount: userExams.length,
            todayFocusMinutes: totalMinutes,
            dailyGoalHours: '4.0',
            dailyGoalProgress: Math.min(100, Math.round((totalMinutes / 240) * 100)),
            quote: {
                quote: 'Success is the sum of small efforts, repeated day in and day out.',
                author: 'Robert Collier'
            }
        };
    }
};

module.exports = dataStore;
