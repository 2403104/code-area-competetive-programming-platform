const Redis = require('ioredis');
require('dotenv').config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('error', (err) => {
  console.error('Redis Client error:', err);
});

redisSubscriber.on('error', (err) => {
  console.error('Redis Subscriber error:', err);
});

module.exports = { redisClient, redisSubscriber };