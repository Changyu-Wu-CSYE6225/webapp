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
    const username = decoded.split(':')[0];
    const auth_password = decoded.split(':')[1];

    // User authentication
    let rows = await db.users.findOne({
        where: { username: username },
        raw: true,
    });
    if (rows === null) {    // User Validation
        res.status(401);
        throw new Error('Unauthenticated. User not found');
    }
    if (!await bcrypt.compare(auth_password, rows.password)) {  // Password Validation
        res.status(401);
        throw new Error("Unauthenticated. Password not match");
    }

    // Check userId
    if (req.params.userId != rows.id) {
        res.status(403);
        throw new Error("Unauthorized. User id not match");
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
    if (rows === null) {    // User Validation
        res.status(401);
        throw new Error("Unauthenticated. User not found");
    }
    if (!await bcrypt.compare(auth_password, rows.password)) {  // Password Validation
        res.status(401);
        throw new Error("Unauthenticated. Password not match");
    }


    // Product Permission check (if params contain productId)
    const userId = rows.id;
    const { productId } = req.params;
    if (productId) {
        // Check Product Existence
        rows = await db.products.findOne({ where: { id: productId } });
        if (rows === null) {
            res.status(404);
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
    }

    // Pass to next as a parameter
    req.userId = userId;
    req.rows = rows;

    next();
});

module.exports = {
    protectUser,
    protectProduct,
};