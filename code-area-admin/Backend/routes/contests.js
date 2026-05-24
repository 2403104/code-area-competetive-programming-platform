const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// get all contests
router.get('/', authMiddleware, async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startDate: -1 });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get single contest
router.get('/:id', authMiddleware, async (req, res) => { 
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create contest
router.post('/', authMiddleware, async (req, res) => {
    try {
        const contest = new Contest(req.body);
        await contest.save();
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// update contest details
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// delete contest
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Contest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contest deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// add problem to contest
router.post('/:id/problems', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $push: { problems: req.body } },
            { new: true }
        );
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// update a problem inside contest
router.put('/:id/problems/:problemId', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        const prob = contest.problems.id(req.params.problemId);
        if (!prob) return res.status(404).json({ message: 'Problem not found' });
        Object.assign(prob, req.body);
        await contest.save();
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// save hidden testcases for a problem inside contest
router.put('/:id/problems/:problemId/testcases', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        const prob = contest.problems.id(req.params.problemId);
        if (!prob) return res.status(404).json({ message: 'Problem not found' });
        prob.testcases = req.body.testcases;
        await contest.save();
        res.json({ message: 'Hidden test cases saved', problem: prob });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// delete a problem from contest
router.delete('/:id/problems/:problemId', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $pull: { problems: { _id: req.params.problemId } } },
            { new: true }
        );
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// send announcement
router.post('/:id/announce', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $push: { announcements: { text } } },
            { new: true }
        );
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// // Get all submissions for a contest (from contest.submissions)
// router.get('/:id/submissions', authMiddleware, async (req, res) => {
//     try {
//         const contest = await Contest.findById(req.params.id);
//         if (!contest) return res.status(404).json({ message: 'Contest not found' });

//         const contestProblemIds = contest.problems.map(p => p._id.toString());

//         const allSubmissions = [];
//         contest.submissions.forEach(userSub => { 
//             userSub.mySubmissions.forEach(sub => {
//                 if (contestProblemIds.includes(sub.problemId.toString())) {
//                     allSubmissions.push({
//                         ...sub.toObject(),
//                         username: userSub.username
//                     });
//                 }
//             });
//         });

//         allSubmissions.sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
//         res.json(allSubmissions);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

router.get('/:id/submissions', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const contestProblemIds = new Set(contest.problems.map(p => p._id.toString()));

        const allSubmissions = contest.submissions;

        allSubmissions.sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
        res.json(allSubmissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get registered candidates with stats from contest.submissions
router.get('/:id/candidates', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const contestProblemIds = contest.problems.map(p => p._id.toString());

        const candidateStats = contest.registeredCandidate.map(candidate => {
            const userSubEntry = contest.submissions.find(s => s.username === candidate.username);
            const mySubmissions = userSubEntry ? userSubEntry.mySubmissions : [];

            const contestSubs = mySubmissions.filter(s => contestProblemIds.includes(s.problemId.toString()));
            const solvedProblems = new Set(contestSubs.filter(s => s.status === 'AC').map(s => s.problemId.toString()));

            const standing = contest.finalStanding.find(f => f.username === candidate.username);

            return {
                username: candidate.username,
                registeredAt: candidate.registeredAt,
                solved: solvedProblems.size,
                totalSubmissions: contestSubs.length,
                totalScore: standing ? standing.totalScore : 0,
                rank: standing ? contest.finalStanding.indexOf(standing) + 1 : null,
                correctCnt: standing ? standing.correctCnt : 0,
                penalty: standing ? standing.penalty : 0
            };
        });

        candidateStats.sort((a, b) => (b.totalScore - a.totalScore) || (a.penalty - b.penalty));
        res.json(candidateStats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
