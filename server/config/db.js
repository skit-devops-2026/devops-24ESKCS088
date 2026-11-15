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

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyplanner';
    const isLocalhost = uri.includes('127.0.0.1') || uri.includes('localhost');

    // In production (like on Render), avoid spamming localhost connection attempts if no cloud DB is provided
    if (process.env.NODE_ENV === 'production' && isLocalhost) {
        console.log('ℹ️ Running in cloud environment without external MongoDB Atlas URI.');
        console.log('🚀 High-performance built-in storage (dataStore) is active for authentication, tasks and dashboard.');
        console.log('💡 To connect to MongoDB Atlas, add MONGO_URI in Render Dashboard -> Environment.');
        isConnecting = false;
        return;
    }

    try {
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
        isConnecting = false;
        if (process.env.NODE_ENV === 'production' && isLocalhost) {
            console.log('ℹ️ Localhost MongoDB not available in cloud. Using in-memory fallback storage.');
            return;
        }
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn(`🔄 Will retry connecting to MongoDB in 10 seconds...`);
        if (!retryTimeout) {
            retryTimeout = setTimeout(() => {
                retryTimeout = null;
                connectDB();
            }, 10000);
        }
    }
};

mongoose.connection.on('disconnected', () => {
    const uri = process.env.MONGO_URI || '';
    const isLocalhost = !uri || uri.includes('127.0.0.1') || uri.includes('localhost');
    if (process.env.NODE_ENV === 'production' && isLocalhost) {
        return;
    }
    console.warn(`⚠️ MongoDB disconnected! Retrying connection in 10 seconds...`);
    if (!retryTimeout) {
        retryTimeout = setTimeout(() => {
            retryTimeout = null;
            connectDB();
        }, 10000);
    }
});

mongoose.connection.on('error', (err) => {
    const uri = process.env.MONGO_URI || '';
    const isLocalhost = !uri || uri.includes('127.0.0.1') || uri.includes('localhost');
    if (process.env.NODE_ENV === 'production' && isLocalhost) {
        return;
    }
    console.error(`❌ MongoDB Runtime Error: ${err.message}`);
});

module.exports = connectDB;
