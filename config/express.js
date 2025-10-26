import fs from "fs";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import responseTime from "response-time";
import rateLimit from "express-rate-limit";
import * as FileStreamRotator from "file-stream-rotator";
import { errorMiddleware } from "../app/middleware/errors.middleware";
import { validateData } from "../app/middleware/validation.middleware";
import { envValidator } from "../app/validate/env.validate";
import loggerInit from "./logger";
import { baseRouter, sessionRouter, experimentsRouter } from "../app/routes/index";
import { handleCors } from "../app/middleware/cors.middleware";
import { environments } from "../app/enums";
import config from ".";

validateData(envValidator); // TODO: complete env validator

const logDirectory = "./log";
const checkLogDir = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const expressConfig = (app) => {
    let accessLogStream, logger;

    // initialize logger
    if (app.get("env") === "development") {
        logger = loggerInit("development");
    } else if (app.get("env") === "production") {
        logger = loggerInit("production");
    } else if (app.get("env") === "test") {
        logger = loggerInit("test");
    } else {
        logger = loggerInit();
    }

    global.logger = logger;
    logger.info("Application starting...");
    logger.debug("Overriding 'Express' logger");

    if (checkLogDir) {
        accessLogStream = FileStreamRotator.getStream({
            date_format: "YYYYMMDD",
            filename: `${logDirectory}/access-%DATE%.log`,
            frequency: "weekly",
            verbose: false,
        });
    }

    app.use(morgan("combined", { stream: accessLogStream }));

    app.use(express.json({ limit: '10mb' }));
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: { error: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false, limit: "2mb" }));

    app.use(cors(handleCors));
    // Use helmet to secure Express headers
    app.use(helmet());
    app.disable("x-powered-by");
    app.use(
        responseTime((req, res, time) => {
            if (
                config.appEnvironment != environments.TEST &&
                config.appEnvironment != environments.DEVELOPMENT &&
                config.appEnvironment != environments.PRODUCTION
            ) {
                logger.info(
                    `METHOD: ${req.method}, URL: ${req.url}, TIME: ${time}`
                );
            }
        })
    );

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Authorization, Origin, Content-Type, Accept"
        );
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });

    const baseUrl = "/api/v1";
    app.use(`${baseUrl}`, apiLimiter);
    app.use(`${baseUrl}`, baseRouter);
    app.use(`${baseUrl}/sessions`, sessionRouter);
    app.use(`${baseUrl}/experiments`, experimentsRouter);

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        const status = 404;
        return res.status(status).json({
            success: false,
            statusCode: status,
            message: "Route not found",
        });
    });

    app.use(errorMiddleware);
};

export default expressConfig;
