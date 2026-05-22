const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: String, required: true }
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
