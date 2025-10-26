import { CurrentSessionModel, SessionModel } from "../models";

/**
 * Get sessions
 * @param {Object} payload the req.body payload
 * @returns {Promise<String | Error>}
 */
export const sessions = async () => {
    return await SessionModel.findAll();
};

/**
 * Create session
 * @param {Object} payload the req.body payload
 * @returns {Promise<String | Error>}
 */
export const currentSession = async (title = "Untitled") => {
    let session = await CurrentSessionModel.getSession();
	
	if (!session) {
		// Create new session if none exists
		session = await SessionModel.create(title);
		await CurrentSessionModel.set(session.id);
	}

    return session;
}

export async function create(title) {
    const session = await SessionModel.create(title);
    await CurrentSessionModel.set(session.id);

    return session;
}

export async function update(id, title) {
    return await SessionModel.update(id, title);
}

export async function remove(id) {
    const deleted = await SessionModel.delete(id);
    const current = await CurrentSessionModel.get();
    if (current?.id === id) await CurrentSessionModel.clear();

    return deleted;
}