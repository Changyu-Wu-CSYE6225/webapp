const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

const logger = winston.createLogger({
    format: combine(
        timestamp(),
        printf((log) => {
            return `${log.timestamp} - [${log.level}]: ${log.message}`;
        })
    ),
    transports: [
        process.env.NODE_ENV === 'development' ? new winston.transports.Console()
            : new winston.transports.File(
                {
                    filename: './logger/webapp.log',
                    handleExceptions: true,
                    handleRejections: true,
                }),
    ],
});

module.exports = logger;