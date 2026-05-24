const express = require('express');
const router = express.Router();
const { getAllDiscussions, createDiscussion } = require('../controllers/discussionController');
const { fetchUser } = require('../middleware/fetchUser');

router.get('/get-all-discussions', getAllDiscussions);
router.post('/create-discussion', fetchUser, createDiscussion);

module.exports = router;
