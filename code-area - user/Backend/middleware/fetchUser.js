const jwt = require('jsonwebtoken');
require('dotenv').config();

const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token. Access denied." });
    }
}
module.exports={fetchUser};