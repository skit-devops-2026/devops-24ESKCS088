const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyplanner';

async function checkDatabase() {
    const showDetails = process.argv.includes('--details') || process.argv.includes('-d');

    console.log('\n========================================');
    console.log('   🔍 STUDY PLANNER - MONGODB STATUS    ');
    console.log('========================================\n');
    console.log(`Connecting to: ${MONGO_URI} ...`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connection status: CONNECTED\n');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log('Database is currently empty (no collections created yet).');
        } else {
            console.log('📊 Collections & Document Counts:');
            console.log('----------------------------------------');
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(` • ${col.name.padEnd(20)}: ${count} document(s)`);

                if (showDetails && count > 0) {
                    const samples = await db.collection(col.name).find().limit(2).toArray();
                    console.log(`   Sample from [${col.name}]:`);
                    samples.forEach((doc, i) => {
                        const preview = { ...doc };
                        if (preview.password) preview.password = '[HASHED]';
                        console.log(`     ${i + 1}.`, JSON.stringify(preview, null, 2).replace(/\n/g, '\n        '));
                    });
                    console.log('');
                }
            }
            console.log('----------------------------------------\n');
        }

        if (!showDetails) {
            console.log('💡 Tip: Run with --details to see actual documents:');
            console.log('   npm run db:check -- --details\n');
        }
        console.log('========================================\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Could not connect to MongoDB:', error.message);
        console.log('\nMake sure MongoDB service is running on your machine.');
        process.exit(1);
    }
}

checkDatabase();
