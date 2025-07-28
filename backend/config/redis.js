const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    // Skip Redis if not configured
    if (!process.env.REDIS_URL) {
      console.log('Redis not configured, skipping...');
      return;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Connected');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Error connecting to Redis:', error.message);
    console.log('Continuing without Redis...');
  }
};

const getRedisClient = () => {
  return redisClient;
};

module.exports = { connectRedis, getRedisClient }; 