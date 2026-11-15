const mongoose = require('mongoose');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const dataStore = require('../utils/dataStore');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email and password' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // In-memory fallback if MongoDB is not connected
        if (mongoose.connection.readyState !== 1) {
            const user = await dataStore.createUser({ name, email: cleanEmail, password });
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                dailyStudyGoal: user.dailyStudyGoal,
                token: generateToken(user._id)
            });
        }

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                dailyStudyGoal: user.dailyStudyGoal,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Invalid user data received' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ error: message });
        }
        if (error.name === 'MongooseError' || (error.message && error.message.includes('buffering timed out'))) {
            try {
                const user = await dataStore.createUser({ name: req.body.name, email: req.body.email, password: req.body.password });
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    dailyStudyGoal: user.dailyStudyGoal,
                    token: generateToken(user._id)
                });
            } catch (fallbackErr) {
                return res.status(400).json({ error: fallbackErr.message });
            }
        }
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // In-memory fallback if MongoDB is not connected
        if (mongoose.connection.readyState !== 1) {
            const user = await dataStore.findUserByEmail(cleanEmail);
            if (user && (await dataStore.verifyPassword(user, password))) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    dailyStudyGoal: user.dailyStudyGoal,
                    token: generateToken(user._id)
                });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = await User.findOne({ email: cleanEmail }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                dailyStudyGoal: user.dailyStudyGoal,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        if (error.name === 'MongooseError' || (error.message && error.message.includes('buffering timed out'))) {
            const user = await dataStore.findUserByEmail(req.body.email);
            if (user && (await dataStore.verifyPassword(user, req.body.password))) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    dailyStudyGoal: user.dailyStudyGoal,
                    token: generateToken(user._id)
                });
            }
        }
        res.status(500).json({ error: error.message || 'Login failed' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const user = (await dataStore.findUserById(req.user._id)) || req.user;
            return res.json(user);
        }
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update user profile / settings
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const user = await dataStore.findUserById(req.user._id);
            if (user) {
                user.name = req.body.name || user.name;
                if (req.body.dailyStudyGoal !== undefined) {
                    user.dailyStudyGoal = req.body.dailyStudyGoal;
                }
                return res.json(user);
            }
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = req.body.name || user.name;
        if (req.body.dailyStudyGoal !== undefined) {
            user.dailyStudyGoal = req.body.dailyStudyGoal;
        }
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            dailyStudyGoal: updatedUser.dailyStudyGoal,
            token: generateToken(updatedUser._id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile
};
