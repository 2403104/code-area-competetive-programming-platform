const jwt = require('jsonwebtoken');
require('dotenv').config();

const fetchAdmin = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.admin = data.admin;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token. Access denied." });
    }
}
module.exports={fetchAdmin};