import { CurrentSessionModel, ExperimentModel, SessionModel } from "../models";

/**
 * Get experiments
 * @param {Object} payload the req.body payload
 * @returns {Promise<String | Error>}
 */
export const experiments = async () => {
    return await ExperimentModel.findAll();
};

/**
 * Get experiment
 * @param {Object} payload the req.body payload
 * @returns {Promise<String | Error>}
 */
export const experiment = async (id) => {
    return await ExperimentModel.findById(id);
};
