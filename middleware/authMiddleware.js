const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const db = require('../database/initDB');
const { QueryTypes } = require('sequelize');


// Base64 Authorization - User Authorization for Get and Put Users
const protectUser = asyncHandler(async (req, res, next) => {
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
    // const [rows, fields] = await db.query("SELECT `username`, `password` FROM User WHERE `id` = ?", [userId]);
    const rows = await db.sequelize.query(
        "SELECT `username`, `password` FROM `Users` WHERE `id` = ?",
        {
            replacements: [userId],
            type: QueryTypes.SELECT,
        },
    );
    if (Object.keys(rows).length <= 0) {
        res.status(400);
        throw new Error("Unauthorized. User not found");
    }

    // Validation
    const { username, password } = rows[0];
    if (username !== auth_username) {
        res.status(403);
        throw new Error('Username not match');
    }
    if (!await bcrypt.compare(auth_password, password)) {
        res.status(401);
        throw new Error("Password not match");
    }

    next();
});



// Base64 Authorization - Require a User Authorization before Product Controller
const protectProduct = asyncHandler(async (req, res, next) => {
    // Check authorization info
    if (!req.headers.authorization) {
        res.status(401);
        throw new Error("Unauthorized. Please provide WWW-Authorization");
    }

    const encoded = req.headers.authorization.split(' ')[1];        // Extract Base64 auth
    const decoded = Buffer.from(encoded, 'base64').toString();      // Decode auth. Default: UTF-8
    const auth_username = decoded.split(':')[0];
    const auth_password = decoded.split(':')[1];

    // Check User info in the database
    let rows = await db.users.findOne({
        where: { username: auth_username },
        raw: true,      // Disable wrapping 
    });
    if (rows === null) {    // No user found
        res.status(401);
        throw new Error("Unauthorized. User not found");
    }

    // Validation
    const { password } = rows;
    if (!await bcrypt.compare(auth_password, password)) {
        res.status(401);
        throw new Error("Password not match");
    }


    // Product Permission check (if params contain productId)
    const userId = rows.id;
    req.userId = userId;
    const { productId } = req.params;
    if (productId) {
        // Check Product Existence
        rows = await db.products.findOne({ where: { id: productId } });
        if (rows === null) {
            res.status(400);
            throw new Error("Product not found");
        }

        // Check Permission (User only has the access to their products)
        rows = await db.sequelize.query("SELECT * FROM `Products` WHERE `id` = ? AND `owner_user_id` = ?",
            {
                replacements: [productId, userId],
                type: QueryTypes.SELECT,
            },
        );
        if (Object.keys(rows).length <= 0) {
            res.status(403);
            throw new Error("User id is not matched with this product. Product is not created by this user");
        }
        req.rows = rows;        // Pass to next as a parameter
    }

    next();
});

module.exports = {
    protectUser,
    protectProduct,
};