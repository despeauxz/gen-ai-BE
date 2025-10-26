import winston, { format } from "winston";
const { combine, timestamp, errors, colorize, printf } = format;

/**
 * 
 * @param {*} env 
 * @returns {winston.Logger}
 */
const logger = (env) => {
    let ret;
    let consoleFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp}, ${level}, ${stack || message}`;
    });

    let fileFormat = printf(({ level, message, timestamp }) => {
        return `${timestamp}, ${level}, ${message}`;
    });

    if (env === "production") {
        ret = new winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: "debug",
                    handleExceptions: true,
                    json: false,
                    colorize: true,
                    format: consoleFormat,
                }),
                new winston.transports.File({
                    level: "info",
                    filename: "./server.log",
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    colorize: false,
                }),
            ],
            exitOnError: false,
        });
    } else if (env === "development") {
        ret = new winston.createLogger({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                fileFormat,
                errors({ stack: true })
            ),
            transports: [
                new winston.transports.Console({
                    level: "debug",
                    handleExceptions: true,
                    json: false,
                    colorize: true,
                    format: consoleFormat,
                }),
                new winston.transports.File({
                    level: "info",
                    filename: "./server.log",
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    colorize: false,
                }),
            ],
            exitOnError: false,
        });
    } else if (env === "test") {
        ret = new winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: "info",
                    filename: "./test.log",
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 50,
                    colorize: false,
                }),
            ],
            exitOnError: false,
        });
    } else {
        // Else return default logger
        return new winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: "debug",
                    handleExceptions: true,
                    json: true,
                    colorize: true,
                }),
            ],
            exitOnError: false,
        });
    }

    ret.stream = {
        write: (message, encoding) => {
            logger.info(message);
        },
    };

    return ret;
};

export default logger;