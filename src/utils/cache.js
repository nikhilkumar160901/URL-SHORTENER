const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis connection error:', err));

exports.get = async (key) => {
    try {
        const value = await redis.get(key);
        if (value) {
            console.log(`Cache hit for key: ${key}`);
        } else {
            console.log(`Cache miss for key: ${key}`);
        }
        return value;
    } catch (error) {
        console.error(`Redis GET error for key ${key}:`, error.message);
        throw error;
    }
};

exports.set = (key, value, ttl = 3600) => redis.set(key, value, 'EX', ttl);
