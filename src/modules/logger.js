const winston = require('winston');
const fs = require('fs');


if (!fs.existsSync('./logs')) {
    fs.mkdirSync(`./logs`);
}

module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.printf((info) => {
            return `${new Date().toUTCString()}: ${info.level}: ${info.message}`
        }),
    ),
    exitOnError: false,
    transports: [
        new winston.transports.File({ level: 'error', filename: './logs/error.log' }),
        new winston.transports.File({ filename: './logs/combined.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log'}),
    ]
})