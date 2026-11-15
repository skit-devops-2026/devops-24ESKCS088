const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../models');
const dataStore = require('../utils/dataStore');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'studyplanner_super_secret_jwt_key_2026'
            );

            if (mongoose.connection.readyState === 1) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                req.user = await dataStore.findUserById(decoded.id) || { _id: decoded.id, name: 'User', email: 'user@example.com' };
            }

            if (!req.user) {
                return res.status(401).json({ error: 'User not found with this token' });
            }
            return next();
        } catch (error) {
            console.error('JWT Verification failed:', error.message);
            return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
        }
    }

    // Development fallback using x-user-id or x-user-email headers
    const devUserId = req.headers['x-user-id'] || req.body?.userId;
    const devUserEmail = req.headers['x-user-email'] || req.body?.userEmail;

    if (devUserId || devUserEmail) {
        try {
            let foundUser;
            if (mongoose.connection.readyState === 1) {
                if (devUserId) {
                    foundUser = await User.findById(devUserId).select('-password');
                }
                if (!foundUser && devUserEmail) {
                    foundUser = await User.findOne({ email: devUserEmail }).select('-password');
                }
            } else {
                foundUser = await dataStore.findUserById(devUserId) || await dataStore.findUserByEmail(devUserEmail);
            }
            if (foundUser) {
                req.user = foundUser;
                return next();
            }
        } catch (err) {
            // Ignore error and proceed to 401
        }
    }

    return res.status(401).json({ error: 'Not authorized, no token provided' });
};

module.exports = { protect };
