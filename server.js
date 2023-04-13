const dotenv = require("dotenv").config();      // Load .env file
const express = require('express');
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoute');
const imageRouter = require('./routes/imageRoute');
const errorHandler = require('./middleware/errorMiddleware');
const db = require("./database/initDB");
const logger = require("./logger/configLogger");
const metricsClient = require("./logger/configMetrics");


// Create a server
const app = express();

// Middleware
app.use(express.json());
// app.use(cors());

// Routes
app.get('/healthz', (req, res) => {
    const startTime = new Date();
    metricsClient.increment("endpoint.healthz.get");    // Count API calls
    logger.info("Connect to server succeed");

    res.send('Healthy Server');

    // Timer
    const endTime = new Date();
    metricsClient.timing('duration.endpoint.healthz.get', endTime - startTime);
});

// app.get('/health', (req, res) => {
//     const startTime = new Date();
//     metricsClient.increment("endpoint.health.get");    // Count API calls
//     logger.info("Connect to server succeed");

//     res.send('Healthy Server');

//     // Timer
//     const endTime = new Date();
//     metricsClient.timing('duration.endpoint.health.get', endTime - startTime);
// });

// Change version
const publish_version = 'v1';
app.use(`/${publish_version}/user`, userRouter);
app.use(`/${publish_version}/product`, productRouter);
app.use(`/${publish_version}/product`, imageRouter);

// Middleware - ErrorHandler
app.use(errorHandler);

// Connect to database and port
logger.info("Creating database...");
const PORT = process.env.PORT || 5001;
const DROP_AND_SYNC = process.env.NODE_ENV === 'development' ? false : true;
db.sequelize.sync({ force: DROP_AND_SYNC })     // Set to false only on development environment
    .then(() => {
        logger.info("Drop and re-sync db succeed");
        app.listen(PORT, () => {
            logger.info(`Server on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("Connect to database failed");
        logger.error(err);
    });


module.exports = app;