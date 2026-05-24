const contest = require('./../models/contest');
const Contest = require('./../models/contest')
const getAllContest = async (req, res) => {
  try {
    const allContest = await Contest.find();
    res.status(201).json({ success: true, contests: allContest })
  } catch (error) {
    console.error("Create Contest Error:", err);
    res.status(500).json({ success: false, error: err });

  }
}
const getChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json(contest);
  } catch (error) {
    console.error("Error fetching challenge:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest Not Found" });
    }
    res.json({ success: true, contest });
  } catch (error) {
    console.error("Error fetching contest by ID:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    contest.registeredCandidateCnt = contest.registeredCandidateCnt + 1;
    contest.registeredCandidate.unshift({ username, registeredAt: new Date() });
    await contest.save();
    res.json({ success: true, message: "Candidate Registered Successfully!" })
  } catch (error) {
    console.error("Registration error:", error);
    res.json({ success: false, error })
  }
}
const unregisterUser = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    contest.registeredCandidate = contest.registeredCandidate.filter(candidate => candidate.username !== username);
    contest.registeredCandidateCnt = contest.registeredCandidateCnt - 1;
    await contest.save();
    res.json({ success: true, message: "User unregistered successfully." });
  } catch (error) {
    console.error("Unregister error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }

}
const checkRegistered = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    const isRegistered = contest.registeredCandidate.some(candidate => candidate.username === username);

    return res.json({ success: true, isRegistered });
  } catch (error) {
    console.error("Error in checkRegistered:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
const { updateUserInRedis } = require('./contestStandingController');
const { redisClient } = require('./redis');

const updateSubmission = async (req, res) => {
  try {
    const { contestId, username, newSubmission } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }

    if (newSubmission.status === "Accepted") {
      for (let prob of contest.problems) {
        if (prob._id.toString() === newSubmission.problemId.toString()) {
          prob.Accepted = (prob.Accepted || 0) + 1;
          break;
        }
      }
    }

    let userFound = false;
    for (let user of contest.submissions) {
      if (user.username === username) {
        user.mySubmissions.push(newSubmission);
        userFound = true;
        break;
      }
    }
    if (!userFound) {
      contest.submissions.push({ username, mySubmissions: [newSubmission] });
    }

    await contest.save();
    try {
      const idMap = new Map();
      const scoreMap = new Map();
      let idx = 1;
      for (const que of contest.problems) {
        idMap.set(String(que._id), idx);
        scoreMap.set(String(que._id), que.score || 100);
        idx++;
      }

      const probId = String(newSubmission.problemId);
      const qNo = idMap.get(probId);
      const qScore = scoreMap.get(probId);

      const hKey = `contest:${contestId}:userdata`;
      const raw = await redisClient.hget(hKey, username);
      const userData = raw
        ? JSON.parse(raw)
        : { score: new Array(contest.problems.length + 1).fill(0), penalty: 0, totalScore: 0, correctCnt: 0 };

      if (userData.score[qNo] <= 0) {
        const wrongAttempts = -userData.score[qNo];
        if (newSubmission.status === 'Accepted') {
          const currScore = Math.max(0.3 * qScore, qScore - wrongAttempts * 50);
          userData.totalScore += currScore;
          userData.penalty += wrongAttempts * 50;
          userData.correctCnt += 1;
          userData.score[qNo] = currScore;
        } else {
          userData.score[qNo] -= 1;
        }
        await updateUserInRedis(contestId, username, userData);
      }
    } catch (redisErr) {
      console.error("Redis update failed:", redisErr);
    }

    res.status(200).json({ success: true, message: "Submission updated successfully" });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
// const updateSubmission = async (req, res) => {
//   try {
//     const { contestId, username, newSubmission } = req.body;
//     const contest = await Contest.findById(contestId);
//     if (!contest) {
//       return res.status(404).json({ success: false, error: "Contest not found" });
//     }
//     if (newSubmission.status === "Accepted") {
//       for (let prob of contest.problems) {
//         if (prob._id.toString() === newSubmission.problemId.toString()) {
//           prob.Accepted = (prob.Accepted || 0) + 1;
//           break;
//         }
//       }
//     }
//     let userFound = false;
//     for (let user of contest.submissions) {
//       if (user.username === username) {
//         user.mySubmissions.push(newSubmission);
//         userFound = true;
//         break;
//       }
//     }
//     if (!userFound) {
//       contest.submissions.push({
//         username,
//         mySubmissions: [newSubmission]
//       });
//     };
//     await contest.save();
//     res.status(200).json({ success: true, message: "Submission updated successfully" });
//   } catch (error) {
//     console.error("Error updating submission:", error);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// }
const updateCurentStanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalStanding } = req.body;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }
    contest.finalStanding = finalStanding;

    await contest.save();

    res.status(200).json({ success: true, message: 'Final standings updated successfully' });
  } catch (error) {
    console.error('Error updating final standings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const checkAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ allowed: false, erro: 'Contest Not Found.' });
    const isRegistered = contest.registeredCandidate.some(user => {
      return user.username === username;
    });

    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(startDate.getTime() + contest.duration * 60000);
    const inTime = now >= startDate && now <= endDate;
    if (inTime && isRegistered) {
      return res.json({ allowed: true });
    } else {
      return res.status(403).json({ allowed: false, error: 'Access denied.' });
    }

  } catch (error) {
    console.error('checkAccess error:', error);
    return res.status(500).json({ allowed: false, error: 'Server error' });
  }
}
module.exports = { getChallenge, getAllContest, getContestById, registerUser, unregisterUser, checkRegistered, updateSubmission, updateCurentStanding, checkAccess }