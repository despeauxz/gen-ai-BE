import { Response } from "../utils";
import { SessionService } from "../services";
import { CurrentSessionModel, SessionModel } from "../models";

/**
 * List all sessions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const listSessions = async (req, res) => {
    const data = await SessionService.sessions();
    
    return Response.success(res, "Sessions listed", 200, data);
};

/**
 * Current session
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const currentSession = async (req, res) => {
    const data = await SessionService.currentSession();
    
    return Response.success(res, "Current session", 200, data);
};

/**
 * Create session
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const addSession = async (req, res) => {
    const { title } = req.body;
    const data = await SessionService.create(title);
    
    return Response.success(res, "Session created!", 201, data);
};

/**
 * Update current session
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const updateCurrentSession = async (req, res) => {
    const { id } = req.params;
	
	const session = await SessionModel.findById(id);
	if (!session) {
        return Response.error(res, 'Session not found', 400);
	}
	
	// Set as current
	const data = await CurrentSessionModel.set(id);
    
    return Response.success(res, "Session updated!", 200, data);
};

/**
 * Update session
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const updateSession = async (req, res) => {
    const { title } = req.body;
    const { id } = req.params;
    const data = await SessionService.update(id, title);
    
    return Response.success(res, "Session updated!", 200, data);
};

/**
 * Delete session
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof SessionController
 */
export const removeSession = async (req, res) => {
    const { id } = req.params;
    const data = await SessionService.remove(id);
    
    return Response.success(res, "Session removed!", 200, data);
};
