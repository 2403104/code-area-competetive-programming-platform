const { Redis } = require('ioredis');
require('dotenv').config();

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

module.exports = { client };