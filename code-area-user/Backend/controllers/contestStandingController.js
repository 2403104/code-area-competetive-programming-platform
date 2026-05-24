const express = require('express');
const router = express.Router();
const Contest = require('../models/contest');
const { redisClient, redisSubscriber } = require('./redis');

const activeFlushIntervals = new Map();

function toCompositeScore(totalScore, correctCnt, penalty) {
  return totalScore * 1e10 + correctCnt * 1e5 - penalty;
}

async function populateRedisFromDB(contestId) {
  const contest = await Contest.findById(contestId);
  if (!contest) return null;

  const { rankData, problemCount } = calculateStandings(contest);
  const zKey = `contest:${contestId}:standings`;
  const hKey = `contest:${contestId}:userdata`;
  const pKey = `contest:${contestId}:problemCount`;

  const pipeline = redisClient.pipeline();
  pipeline.del(zKey);
  pipeline.del(hKey);

  for (const user of rankData) {
    pipeline.zadd(zKey, toCompositeScore(user.totalScore, user.correctCnt, user.penalty), user.username);
    pipeline.hset(hKey, user.username, JSON.stringify({
      score: user.score,
      penalty: user.penalty,
      totalScore: user.totalScore,
      correctCnt: user.correctCnt,
    }));
  }

  pipeline.set(pKey, problemCount, 'EX', 86400);
  pipeline.expire(zKey, 86400);
  pipeline.expire(hKey, 86400);

  await pipeline.exec();
  return problemCount;
}

function calculateStandings(contest) {
  const idMap = new Map();
  const scoreMap = new Map();
  let idx = 1;

  for (const que of contest.problems) {
    idMap.set(String(que._id), idx);
    scoreMap.set(String(que._id), que.score || 100);
    idx++;
  }

  const qCnt = contest.problems.length;
  const userSet = new Set();
  const rankData = [];

  for (const detail of contest.submissions) {
    const { username, mySubmissions } = detail;
    userSet.add(username);

    const sorted = [...mySubmissions].sort(
      (a, b) => new Date(a.submissionTime) - new Date(b.submissionTime)
    );

    const arr = new Array(qCnt + 1).fill(0);
    let penalty = 0, totalScore = 0, correctCnt = 0;

    for (const [probId, qNo] of idMap.entries()) {
      let wrongAttempts = 0;
      let solved = false;

      for (const sub of sorted) {
        if (String(sub.problemId) === probId) {
          if (sub.status === 'Accepted') {
            correctCnt++;
            const qScore = scoreMap.get(probId);
            const currScore = Math.max(0.3 * qScore, qScore - wrongAttempts * 50);
            arr[qNo] = currScore;
            totalScore += currScore;
            penalty += wrongAttempts * 50;
            solved = true;
            break;
          } else {
            wrongAttempts++;
          }
        }
      }

      if (!solved && wrongAttempts > 0) {
        arr[qNo] = -wrongAttempts;
      }
    }

    rankData.push({ username, score: arr, penalty, totalScore, correctCnt });
  }

  for (const user of contest.registeredCandidate) {
    if (!userSet.has(user.username)) {
      rankData.push({
        username: user.username,
        score: new Array(qCnt + 1).fill(0),
        penalty: 0,
        totalScore: 0,
        correctCnt: 0,
      });
    }
  }

  return { rankData, problemCount: qCnt };
}

async function updateUserInRedis(contestId, username, userData) {
  const zKey = `contest:${contestId}:standings`;
  const hKey = `contest:${contestId}:userdata`;
  const pipeline = redisClient.pipeline();
  pipeline.zadd(zKey, toCompositeScore(userData.totalScore, userData.correctCnt, userData.penalty), username);
  pipeline.hset(hKey, username, JSON.stringify({
    score: userData.score,
    penalty: userData.penalty,
    totalScore: userData.totalScore,
    correctCnt: userData.correctCnt,
  }));
  await pipeline.exec();
  await redisClient.publish(`contest:${contestId}:update`, 'update');
}

async function readRedisStandings(contestId) {
  const zKey = `contest:${contestId}:standings`;
  const hKey = `contest:${contestId}:userdata`;

  const usernames = await redisClient.zrevrange(zKey, 0, -1);
  if (usernames.length === 0) return null;

  const pipeline = redisClient.pipeline();
  for (const username of usernames) {
    pipeline.hget(hKey, username);
  }
  const results = await pipeline.exec();

  return usernames.map((username, i) => {
    const data = JSON.parse(results[i][1]);
    return { username, ...data };
  });
}

function startFlushInterval(contestId, intervalMS = 5 * 60 * 1000) {
  const intervalId = setInterval(async () => {
    const standing = await readRedisStandings(contestId);
    if(!standing) return;
    await Contest.findByIdAndUpdate(contestId, { finalStanding: standing });
    console.log(`Standings flushed to DB for contest ${contestId}`);
  }, intervalMS);
  activeFlushIntervals.set(contestId, intervalId);
};

router.get('/:id/standings/stream', async (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // send headers immediately

  if(!activeFlushIntervals.has(id)) {
    activeFlushIntervals.set(id, null);
    startFlushInterval(id);
  }

  const sendCurrent = async () => {
    const standings = await readRedisStandings(id);
    if (!standings) return;
    const problemCount = Number(await redisClient.get(`contest:${id}:problemCount`));
    res.write(`data: ${JSON.stringify({ standings, problemCount })}\n\n`);
  };

  const existingCount = await redisClient.zcard(`contest:${id}:standings`);
  if (existingCount === 0) {
    try {
      await populateRedisFromDB(id);
    } catch (err) {
      console.error('Cold-start error: ', err);
    }
  }

  await sendCurrent();

  const channel = `contest:${id}:update`;

  const onMessage = async (chan) => {
    if (chan === channel) await sendCurrent();
  };

  redisSubscriber.subscribe(channel);
  redisSubscriber.on('message', onMessage);

  req.on('close', () => {
    redisSubscriber.unsubscribe(channel);
    redisSubscriber.removeListener('message', onMessage);
    res.end();
  });
});

module.exports = { router, updateUserInRedis };