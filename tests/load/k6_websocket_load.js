import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 1000 }, // ramp up to 1000 concurrent WebSocket connections
        { duration: '1m', target: 1000 }, // hold
        { duration: '30s', target: 0 },   // ramp down
    ],
    thresholds: {
        ws_connecting: ['p(95)<100'],
        checks: ['rate>0.99'],
    },
};

const WS_URL = __ENV.WS_BASE_URL || 'ws://localhost:3000';

export default function () {
    const url = `${WS_URL}/ws/session/1`;

    const res = ws.connect(url, {}, function (socket) {
        socket.on('open', function () {
            // Send presence heartbeat and ping messages
            socket.setInterval(function timeout() {
                socket.send(JSON.stringify({ type: 'heartbeat' }));
            }, 10000); // 10s heartbeat
            
            socket.setInterval(function timeout() {
                socket.send(JSON.stringify({ type: 'ping' }));
            }, 5000); // 5s ping
        });

        socket.on('message', function (msg) {
            // handle incoming messages if necessary
        });

        socket.on('close', function () {
            // connection closed
        });

        socket.on('error', function (e) {
            if (e.error() != 'websocket: close sent') {
                console.log('An unexpected error occurred: ', e.error());
            }
        });

        // Close after 30 seconds to simulate a user session
        socket.setTimeout(function () {
            socket.close();
        }, 30000);
    });

    check(res, { 'status is 101': (r) => r && r.status === 101 });
}
