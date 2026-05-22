const Problem = require('../models/problems');

const addProblem = async (req, res) => {
    try {
        const {
            QNo,
            title,
            description,
            difficulty,
            constraints,
            topics,
            sampleTestCases,
            testcases
        } = req.body;
        const problem = new Problem({
            QNo,
            title,
            description,
            difficulty,
            constraints,
            topics,
            sampleTestCases,
            testcases            
        });
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(201).json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};

const getProblemByTitle = async (req, res) => {
    try {
        const problem = await Problem.findOne({ title: req.params.title });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addProblem, getAllProblems, getProblemByTitle, getProblemById };
