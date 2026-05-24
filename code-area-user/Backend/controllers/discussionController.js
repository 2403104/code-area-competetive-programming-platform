const Discussion = require('../models/Discussions');

const getAllDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find().sort({ createdAt: -1 });
        res.json({ success: true, discussions });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const createDiscussion = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }
        const userId = req.user.id;
        const User = require('../models/user');
        const user = await User.findById(userId).select('username');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const discussion = new Discussion({
            title: title.trim(),
            message: message.trim(),
            username: user.username
        });
        await discussion.save();
        res.status(201).json({ success: true, discussion });
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = { getAllDiscussions, createDiscussion };
