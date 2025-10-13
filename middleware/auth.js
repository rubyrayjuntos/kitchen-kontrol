const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

module.exports = function (req, res, next) {
    // Accept Authorization: Bearer <token>, x-auth-token, or ?token
    const headerAuth = req.get('Authorization') || req.headers['authorization'] || req.headers['Authorization'] || req.headers['x-auth-token'];
    let token = null;

    if (headerAuth && typeof headerAuth === 'string') {
        if (headerAuth.toLowerCase().startsWith('bearer ')) {
            token = headerAuth.slice(7).trim();
        } else {
            token = headerAuth.trim();
        }
    }

    // fallback to query param
    if (!token && req.query && req.query.token) token = req.query.token;

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        // Keep a concise error for debugging jwt issues without exposing tokens
        console.error('auth: jwt verify error:', err && err.message);
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};