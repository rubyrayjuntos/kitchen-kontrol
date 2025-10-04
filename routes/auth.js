const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

router.post("/login",
    body('email').isEmail(),
    body('password').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            console.error(err);
            next(err);
        } else if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
        } else {
            console.log('Hashed password from DB:', user.password);
            console.log('Password from frontend:', password);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
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