import { Response } from "../utils";
import { CurrentSessionModel, ExperimentModel, SessionModel } from "../models";
import { calculateQualityMetrics } from "../utils/helpers";

/**
 * List all experiments
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } A JSON response containing the details of the user added
 * @memberof ExperimentController
 */
export const list = async (req, res) => {
    const { sessionId, sender } = req.query;
	
	const experiments = await ExperimentModel.findAll({ 
		sessionId, 
		sender 
	});
    
    return Response.success(res, "Experiments listed", 200, experiments);
};

/**
 * @route   GET /api/experiments/:id
 * @desc    Get single experiment by ID
 * @access  Public
 * @params  id - experiment UUID
 */
export const getExperiment = async (req, res) => {
    const { id } = req.params;
	
	const experiment = await ExperimentModel.findById(id);
	
	if (!experiment) {
        return Response.error(res, 'Experiment not found', 404)
	}
    
    return Response.success(res, "Experiments listed", 200, experiment);
};

/**
 * @route   POST /api/experiments
 * @desc    Create new experiment with user message and assistant response
 * @access  Public (Rate limited: 10/minute)
 * @body    { prompt: string, parameters: object }
 */
export const addExperiment = async (req, res) => {
	const { prompt, parameters } = req.body;
		
	// Get current session
	const currentSessionId = await CurrentSessionModel.get();
	if (!currentSessionId) {
		return Response.error(res, 'No active session. Create a session first.', 400)
	}
	
	// Verify session exists
	const session = await SessionModel.findById(currentSessionId);
	if (!session) {
		return Response.error(res, 'Session not found', 400)
	}
	
	// Extract parameters with defaults
	const { 
		temperature = 0.7, 
		topP = 0.9, 
		maxTokens = 1000, 
		model = "mock-model" 
	} = parameters;
	
	// Generate 3 variations
	const variations = [
		{ temp: Math.max(0.1, temperature - 0.2), label: "Conservative" },
		{ temp: temperature, label: "Balanced" },
		{ temp: Math.min(1.0, temperature + 0.2), label: "Creative" },
	];
	
	// Generate responses for each variation
	const responses = variations.map((variation, index) => {
		const content = `Simulated ${variation.label} response for prompt: "${prompt.slice(
			0,
			60
		)}..." with temperature ${variation.temp.toFixed(2)}.`;
		
		const scores = calculateQualityMetrics(content, prompt);
		
		return {
			id: `response-${Date.now()}-${index}`,
			content,
			parameters: { 
				...parameters, 
				temperature: variation.temp,
				variation: variation.label 
			},
			scores,
		};
	});
	
	// Create experiment with user message in transaction
	// This creates 2 rows: user message + assistant experiment
	// Also updates session message_count and title
	const result = await ExperimentModel.createExperimentWithMessage(
		currentSessionId,
		prompt,
		parameters,
		responses
	);

	return Response.success(res, 'Experiment created', 201, {
		experiment: result.experiment[0],      // Assistant response
		userPrompt: result.userMessage[0],     // User message
		session: result.session [0] 
	});
}

/**
 * @route   PUT /api/experiments/:id
 * @desc    Update experiment fields
 * @access  Public
 * @params  id - experiment UUID
 * @body    { parameters?, responses?, text?, prompt? }
 */
export const updateExperiment = async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	
	// Update experiment
	const experiment = await ExperimentModel.update(id, updates);
	
	if (!experiment) {
		return Response.error(res, 'Experiment not found', 400)
	}

	return Response.success(res, 'Experiment updated!', 200, experiment);
}

/**
 * @route   DELETE /api/experiments/:id
 * @desc    Delete single experiment
 * @access  Public
 * @params  id - experiment UUID
 */
export const removeExperiment = async (req, res) => {
	const { id } = req.params;
	
	// Delete experiment
	const deleted = await ExperimentModel.delete(id);

	if (!deleted) {
		return Response.error(res, 'Experiment not found', 400)
	}

	return Response.success(res, 'Experiment deleted successfully', 200);
}

/**
 * @route   GET /api/experiments/:id
 * @desc    Get experiments by session ID
 * @access  Public
 * @params  id - experiment UUID
 */
export const getExperimentsBySession = async (req, res) => {
    const { id } = req.params;
	
	const experiments = await ExperimentModel.findBySession(id);
    
    return Response.success(res, "Experiments listed", 200, experiments);
};