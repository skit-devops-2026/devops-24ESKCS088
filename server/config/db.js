const mongoose = require('mongoose');

let isConnecting = false;
let retryTimeout = null;

const connectDB = async () => {
    // If already connected, do nothing
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (isConnecting) {
        return;
    }

    isConnecting = true;

    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyplanner';
        console.log(`Connecting to MongoDB...`);

        // Fail-fast buffer timeout so requests never hang for 10s
        mongoose.set('bufferTimeoutMS', 5000);

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 20,
            minPoolSize: 2,
            family: 4
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        isConnecting = false;
        if (retryTimeout) {
            clearTimeout(retryTimeout);
            retryTimeout = null;
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        isConnecting = false;
        console.warn(`🔄 Will retry connecting to MongoDB in 3 seconds...`);
        if (!retryTimeout) {
            retryTimeout = setTimeout(() => {
                retryTimeout = null;
                connectDB();
            }, 3000);
        }
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️ MongoDB disconnected! Retrying connection in 3 seconds...`);
    if (!retryTimeout) {
        retryTimeout = setTimeout(() => {
            retryTimeout = null;
            connectDB();
        }, 3000);
    }
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB Runtime Error: ${err.message}`);
});

module.exports = connectDB;
