const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const validateEmail = require('../utils/authService');
const db = require('../database/initDB');
const { QueryTypes } = require('sequelize');
const logger = require('../logger/configLogger');
const metricsClient = require("../logger/configMetrics");


// Create a user account
const createUser = asyncHandler(async (req, res) => {
    const startTime = new Date();
    metricsClient.increment('endpoint.v1.user.post');   // Count API calls
    logger.info("Creating a new user...");

    const { first_name, last_name, password, username } = req.body;

    // Field validation
    if (!first_name || !last_name || !password || !username) {
        res.status(400);
        throw new Error("Please add all required fields - first name, last name, password and username");
    }

    // Email validation
    if (!validateEmail(username)) {
        res.status(400);
        throw new Error("Invalid email");
    }

    // Email existence validation
    let rows = await db.users.findOne({ where: { username: username, }, });
    // [rows, fields] = await db.query("SELECT * FROM User WHERE `username` = ?", [username]);
    if (rows !== null) {        // Email already exist
        res.status(400);
        throw new Error("Username exist");
    };


    // Create Date info
    // const date = new Date;
    // const account_created = date.toISOString();
    // const account_updated = account_created;

    // Encrypt password
    const salt = await bcrypt.genSalt(8);
    const savedPassword = await bcrypt.hash(password, salt);

    // Create user and add to database
    rows = await db.users.create({
        first_name,
        last_name,
        password: savedPassword,
        username,
    });
    // [rows, fields] = await db.query("INSERT INTO User (`first_name`, `last_name`, `password`, `username`, `account_created`, `account_updated`) VALUES (?,?,?,?,?,?)",
    //     [first_name, last_name, savedPassword, username, account_created, account_updated]);

    // Response
    logger.info("Create a new user succeed");
    const { id, account_created, account_updated } = rows.dataValues;
    res.status(201).json({
        id, first_name, last_name, username, account_created, account_updated,
    });

    // Timer
    const endTime = new Date();
    metricsClient.timing('duration.v1.user.post', endTime - startTime);
});



// Get user account information
const getUser = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.user.get');    // Count API calls
    logger.info("Getting user information...");

    // Extract userId from request parameters
    const { userId } = req.params;

    // Query account info by id (no password)
    let rows = await db.sequelize.query(
        "SELECT `id`, `first_name`, `last_name`, `username`, `account_created`, `account_updated` FROM `Users` WHERE `id` = ?",
        {
            replacements: [userId],
            type: QueryTypes.SELECT,
        },
    );
    // const [rows, fields] = await db.query("SELECT `id`, `first_name`, `last_name`, `username`, `account_created`, `account_updated` FROM User WHERE `id` = ?", [userId]);

    // Response
    logger.info("Get user information succeed");
    const { id, first_name, last_name, username, account_created, account_updated } = rows[0];
    res.status(200).json({
        id, first_name, last_name, username, account_created, account_updated
    });

    // Timer
    metricsClient.timing('duration.v1.user.get', new Date() - req.startTime);
});



// Update user account information
const updateUser = asyncHandler(async (req, res) => {
    metricsClient.increment('endpoint.v1.user.put');    // Count API calls
    logger.info("Updating user information...");

    const { userId } = req.params;

    // Field validation
    const { first_name, last_name, password } = req.body;
    if (!first_name || !last_name || !password) {
        res.status(400);
        throw new Error("Please add first name, last name and password");
    }
    if (Object.keys(req.body).length > 3) {
        res.status(400);
        throw new Error("Only first name, last name and password could be changed");
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(8);
    const savedPassword = await bcrypt.hash(password, salt);

    // Date info
    // const date = new Date;
    // const account_updated = date.toISOString();

    // Update database
    await db.users.update(
        {
            first_name,
            last_name,
            password: savedPassword
        },
        {
            where: { id: userId }
        }
    );
    // const [rows, fields] = await db.query("UPDATE User SET `first_name` = ?, `last_name` = ?, `password` = ?, `account_updated` = ? WHERE `id` = ?",
    //     [first_name, last_name, savedPassword, account_updated, userId]);

    // Response
    logger.info("Update user information succeed");
    res.status(204).json();

    // Timer
    metricsClient.timing('duration.v1.user.put', new Date() - req.startTime);
});




module.exports = {
    createUser,
    getUser,
    updateUser,
};