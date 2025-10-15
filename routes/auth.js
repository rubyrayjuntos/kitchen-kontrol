const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const { authValidation } = require('../middleware/validation');

router.post("/login", authValidation.login, (req, res, next) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            console.error(err);
            next(err);
        } else if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password verification result:', isMatch ? 'success' : 'failed');
            if (isMatch) {
                const token = jwt.sign({ id: user.id, permissions: user.permissions }, JWT_SECRET, { expiresIn: '1h' });
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [user.id, `User ${user.name} logged in`],
                    (err) => { if (err) next(err); }
                );
                res.json({ token });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        }
    });
});

module.exports = router;