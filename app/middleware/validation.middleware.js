import { Response, Validate } from '../utils';

/**
 * Middleware to validate payload
 * @param {Request} schema - The format of the joi validation.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {function} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ValidateMiddleware
 */
export const validateData = (schema) => async (req, res, next) => {
  try {
    const isValid = await Validate(req.body, schema);
    if (!isValid.error) {
      return next();
    }
    const { message } = isValid.error.details[0];

    return Response.error(res, message.replace(/["]/gi, ''), 400);
  } catch (error) {
    return Response.error(res, 'Error validating payload');
  }
};

/**
 * Middleware to validate query parameters
 * @param {Request} schema - The format of the joi validation.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {function} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ValidateMiddleware
 */
export const validateQuery = (schema) => async (req, res, next) => {
  try {
    const isValid = await Validate(req.query, schema);
    if (!isValid.error) {
      return next();
    }
    const { message } = isValid.error.details[0];
    return Response.error(res, message.replace(/["]/gi, ''), 400);
  } catch (error) {
    return Response.error(res, 'Error validating payload');
  }
};


/**
 * Middleware to validate query parameters
 * @param {Request} schema - The format of the joi validation.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {function} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ValidateMiddleware
 */
export const validateParams = (schema) => async (req, res, next) => {
  try {
    const isValid = await Validate(req.params, schema);
    if (!isValid.error) {
      return next();
    }
    const { message } = isValid.error.details[0];
    return Response.error(res, message.replace(/["]/gi, ''), 400);
  } catch (error) {
    return Response.error(res, 'Error validating payload');
  }
};