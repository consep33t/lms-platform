import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 500 }, // ramp up to 500 VUs over 2m
        { duration: '1m', target: 500 }, // hold for 1m
        { duration: '30s', target: 0 },  // ramp down to 0 VUs
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'],
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export default function () {
    // GET /api/v1/modules
    let resModules = http.get(`${BASE_URL}/api/v1/modules`);
    check(resModules, {
        'modules status is 200': (r) => r.status === 200,
    });
    sleep(1);

    // GET /api/v1/leaderboard
    let resLeaderboard = http.get(`${BASE_URL}/api/v1/leaderboard`);
    check(resLeaderboard, {
        'leaderboard status is 200': (r) => r.status === 200,
    });
    sleep(1);

    // POST /api/v1/notes
    const notePayload = JSON.stringify({
        content: 'Test note from k6 load test',
        moduleId: 1
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    let resNotes = http.post(`${BASE_URL}/api/v1/notes`, notePayload, params);
    check(resNotes, {
        'notes status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    });
    sleep(1);
}
