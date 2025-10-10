const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        db.get('SELECT id, name, email, permissions FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};