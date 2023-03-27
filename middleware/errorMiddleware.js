const logger = require("../logger/configLogger");

// Error Handler
const errorHandler = async (err, req, res, next) => {
    // Log
    logger.error(err.message);

    // Status code
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);

    // Message
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,   // Only show when develop application
    });
};

module.exports = errorHandler;