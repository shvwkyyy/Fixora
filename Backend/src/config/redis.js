const { createClient } = require('redis');

const redisClient = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', err => console.log('❌ Redis Error:', err));

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("✅ Redis connected successfully");
    }
}

module.exports = { redisClient, connectRedis };
