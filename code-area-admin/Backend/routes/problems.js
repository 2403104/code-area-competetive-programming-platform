const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();
const {client} = require('../redis/client');

// Get all problems
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (cache_all_problems) {
            return res.json(JSON.parse(cache_all_problems));
        }
        const problems = await Problem.find().sort({ QNo: 1 });
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get problem by id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const cached_problem = await client.get(`problem_${req.params.id}`);
        if (cached_problem) {
            return res.json(JSON.parse(cached_problem));
        }
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
        await client.set(`problem_${req.params.id}`, JSON.stringify(problem), 'EX', Number(process.env.THIRTY_DAYS || 86400));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create problem
router.post('/', authMiddleware, async (req, res) => {
    try {
        const problem = new Problem(req.body);
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update problem
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save hidden testcases
router.put('/:id/testcases', authMiddleware, async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(
            req.params.id,
            { testcases: req.body.testcases },
            { new: true }
        );
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json({ message: 'Hidden test cases saved', problem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete problem
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Problem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
