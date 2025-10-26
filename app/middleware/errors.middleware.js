import config from "../../config";
import logger from "../../config/logger";
import { environments } from "../enums";

/**
 * returns a formatted error message
 * @param {Object} the error object
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next next callback
 * @returns {JSON}
 *
 */
const errorMiddleware = (err, req, res, next) => {
    if (config.appEnvironment != environments.TEST) logger(config.appEnvironment).error(err);
    let status = err.status || 500;
    let message = () => {
        if(environments.PRODUCTION != config.appEnvironment) return err.message; //JSON.stringify(err)
        return status == 500 ? "There's a problem from our end. We are working to fix it." : err.message;
    }

    if (err.type === 'entity.parse.failed') {
		return res.status(400).json({ error: 'Invalid JSON in request body' });
	}
	
	// PostgreSQL specific errors
	if (err.code) {
		switch (err.code) {
			case '23503': // Foreign key violation
				return res.status(400).json({ 
					error: 'Referenced resource not found',
					detail: 'The session or related entity does not exist'
				});
			case '23505': // Unique violation
				return res.status(409).json({ 
					error: 'Resource already exists',
					detail: err.detail
				});
			case '22P02': // Invalid UUID format
				return res.status(400).json({ 
					error: 'Invalid ID format',
					detail: 'ID must be a valid UUID'
				});
			case '42P01': // Undefined table
				return res.status(500).json({
					error: 'Database not properly initialized',
					detail: 'Please run migrations'
				});
			default:
				console.error('Database error:', err.code, err.message);
		}
    }

    res.header("Content-Type", "application/json");
    res.status(status).json({
        success: false,
        statusCode: status,
        message: message(),
    });
};

export { errorMiddleware };
