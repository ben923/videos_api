const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_APP_DEBUG || 'warn',
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;