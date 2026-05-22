const express = require('express');
const router = express.Router();
const Problem = require('../models/problems')
const problemController=require('../controllers/problemController');
router.post('/addproblem',problemController.addProblem);
router.get('/get-all-problems',problemController.getAllProblems);
router.get('/get-problem/:title',problemController.getProblemByTitle);
router.get('/get-problem/:title/:id',problemController.getProblemById);
module.exports=router;