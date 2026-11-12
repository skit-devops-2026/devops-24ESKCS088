const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email and password' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
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
        res.status(500).json({ error: error.message });
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

        // Include password since it is set with select: false in schema
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
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
