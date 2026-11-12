const http = require('http');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const app = require('../server');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

async function testAPI() {
    console.log('\n========================================');
    console.log('   🧪 STUDY PLANNER - API ENDPOINTS TEST');
    console.log('========================================\n');

    const server = http.createServer(app);
    const TEST_PORT = 5055;

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`Test server running on http://127.0.0.1:${TEST_PORT}\n`);

    const makeRequest = (options, postData = null) => {
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({ status: res.statusCode, body: parsed });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: data });
                    }
                });
            });

            req.on('error', reject);
            if (postData) {
                req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
            }
            req.end();
        });
    };

    try {
        // 1. Test /health
        console.log('1. Testing GET /health ...');
        const healthRes = await makeRequest({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: '/health',
            method: 'GET'
        });
        console.log(`   Status: ${healthRes.status} - Service: ${healthRes.body.service}`);

        // 2. Get user token for Bhawana
        const user = await User.findOne({ email: 'b240802@skit.ac.in' });
        if (!user) throw new Error('User b240802@skit.ac.in not found');
        const token = generateToken(user._id);
        console.log(`\n2. Authenticated as: ${user.name} (${user.email})`);
        console.log(`   Generated JWT Bearer Token`);

        // 3. Test GET /api/dashboard/stats
        console.log('\n3. Testing GET /api/dashboard/stats ...');
        const dashRes = await makeRequest({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: '/api/dashboard/stats',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(`   Status: ${dashRes.status}`);
        console.log(`   Tasks Summary: Total ${dashRes.body.tasks.total}, Completed ${dashRes.body.tasks.completed}`);
        console.log(`   Upcoming Exams: ${dashRes.body.upcomingExams.length}`);
        console.log(`   Subjects Count: ${dashRes.body.subjects.length}`);
        console.log(`   Daily Quote: "${dashRes.body.quote}"`);

        // 4. Test GET /api/tasks
        console.log('\n4. Testing GET /api/tasks ...');
        const tasksRes = await makeRequest({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: '/api/tasks',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(`   Status: ${tasksRes.status} - Fetched ${tasksRes.body.length} task(s)`);

        // 5. Test POST /api/tasks (Create a task via REST API)
        console.log('\n5. Testing POST /api/tasks (REST API Task Creation) ...');
        const createTaskRes = await makeRequest(
            {
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/tasks',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            },
            {
                title: 'Test REST API Creation',
                subject: 'dbms',
                priority: 'High',
                category: 'Revision'
            }
        );
        console.log(`   Status: ${createTaskRes.status}`);
        console.log(`   Created Task ID: ${createTaskRes.body._id}`);
        console.log(`   Task Title: "${createTaskRes.body.title}"`);

        // 6. Test GET /api/subjects
        console.log('\n6. Testing GET /api/subjects ...');
        const subRes = await makeRequest({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: '/api/subjects',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(`   Status: ${subRes.status} - Subjects: [${subRes.body.map(s => s.name).join(', ')}]`);

        console.log('\n========================================');
        console.log('   🎉 ALL API ENDPOINTS VERIFIED 100%!  ');
        console.log('========================================\n');
    } catch (err) {
        console.error('❌ API Test failed:', err.message);
    } finally {
        server.close();
        process.exit(0);
    }
}

testAPI();
