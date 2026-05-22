const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await AdminUser.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: 'AdminUser already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new AdminUser({ username, email, password: hashedPassword, isAdmin: 'true' });
    await adminUser.save();
    res.status(201).json({ message: 'AdminUser registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: adminUser._id, username: adminUser.username, email: adminUser.email, isAdmin: adminUser.isAdmin },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    res.json({ token, adminUser: { id: adminUser._id, username: adminUser.username, email: adminUser.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
