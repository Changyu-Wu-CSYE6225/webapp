const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const db = require('../config/connectDB');

// Base64 Authorization
const protect = asyncHandler(async (req, res, next) => {
    // Check authorization info
    if (!req.headers.authorization) {
        res.status(401);
        throw new Error("Unauthorized. Please provide WWW-Authorization");
    }

    const encoded = req.headers.authorization.split(' ')[1];        // Extract Base64 auth
    const decoded = Buffer.from(encoded, 'base64').toString();      // Decode auth. Default: UTF-8
    const auth_username = decoded.split(':')[0];
    const auth_password = decoded.split(':')[1];

    // Get username and password from database
    const { userId } = req.params;
    const [rows, fields] = await db.query("SELECT `username`, `password` FROM User WHERE `id` = ?", [userId]);
    const { username, password } = rows[0];

    // Validation
    if (username !== auth_username) {
        res.status(403);
        throw new Error('Username not match');
    }
    if (!await bcrypt.compare(auth_password, password)) {
        res.status(403);
        throw new Error("Password not match");
    }

    next();
});

module.exports = protect;