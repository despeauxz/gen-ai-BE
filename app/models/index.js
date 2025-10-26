import db from "../../config/db";

const SessionModel = {
	// Get all sessions sorted by updated_at
	async findAll() {
		const result = await db.query(
			'SELECT * FROM sessions ORDER BY updated_at DESC'
		);
		return result;
	},

	// Find session by ID
	async findById(id) {
		const result = await db.query(
			'SELECT * FROM sessions WHERE id = $1',
			[id]
		);
		return result[0] || null;
	},

	// Create new session
	async create(title = null) {
		const sessionCount = await db.query('SELECT COUNT(*) FROM sessions');
		const count = parseInt(sessionCount[0].count) + 1;
		
		const result = await db.query(
			`INSERT INTO sessions (title, message_count) 
				VALUES ($1, 0) 
				RETURNING *`,
			[title || `Chat ${count}`]
		);

		return result[0];
	},

	// Update session
	async update(id, updates) {
		const fields = [];
		const values = [];
		let paramCount = 1;

		if (updates.title !== undefined) {
			fields.push(`title = $${paramCount++}`);
			values.push(updates.title);
		}
		if (updates.message_count !== undefined) {
			fields.push(`message_count = $${paramCount++}`);
			values.push(updates.message_count);
		}

		if (fields.length === 0) {
			return await SessionModel.findById(id);
		}

		values.push(id);
		const result = await db.query(
			`UPDATE sessions 
                SET ${fields.join(', ')} 
                WHERE id = $${paramCount} 
                RETURNING *`,
			values
		);
		return result || null;
	},

	// Increment message count
	async incrementMessageCount(id, increment = 2) {
		const result = await db.query(
			`UPDATE sessions 
                SET message_count = message_count + $1 
                WHERE id = $2 
                RETURNING *`,
			[increment, id]
		);
		return result;
	},

	// Delete session (CASCADE will delete experiments)
	async delete(id) {
		const result = await db.query(
			'DELETE FROM sessions WHERE id = $1 RETURNING id',
			[id]
		);
		return result.rowCount > 0;
	},

	// Auto-update title from first message
	async updateTitleFromPrompt(id, prompt) {
		const session = await SessionModel.findById(id);
		if (session && session.message_count === 0 && session.title.startsWith('Chat ')) {
			const newTitle = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
			return await SessionModel.update(id, { title: newTitle });
		}
		return session;
	},
};


const CurrentSessionModel = {
	// Get current session ID
	async get() {
		const result = await db.query(
			'SELECT session_id FROM current_session WHERE id = 1'
		);
		return result[0]?.session_id || null;
	},

	// Set current session
	async set(sessionId) {
		const result = await db.query(
			`UPDATE current_session 
                SET session_id = $1 
                WHERE id = 1 
                RETURNING session_id`,
			[sessionId]
		);
		return result[0]?.session_id;
	},

	// Clear current session
	async clear() {
		await db.query(
			'UPDATE current_session SET session_id = NULL WHERE id = 1'
		);
	},

	// Get current session with details
	async getSession() {
		const sessionId = await CurrentSessionModel.get();

		if (!sessionId) {
			return null;
		}
		return await SessionModel.findById(sessionId);
	},
};


const ExperimentModel = {
	// Get all experiments for a session
	async findBySession(sessionId) {
		const result = await db.query(
			`SELECT * FROM experiments 
                WHERE session_id = $1 
                ORDER BY created_at ASC`,
			[sessionId]
		);
		return result;
	},

	// Find experiment by ID
	async findById(id) {
		const result = await db.query(
			'SELECT * FROM experiments WHERE id = $1',
			[id]
		);
		return result[0] || null;
	},

	// Get all experiments (optionally filtered)
	async findAll(filters = {}) {
		let queryText = 'SELECT * FROM experiments';
		const values = [];
		const conditions = [];

		if (filters.sessionId) {
			conditions.push(`session_id = $${values.length + 1}`);
			values.push(filters.sessionId);
		}

		if (filters.sender) {
			conditions.push(`sender = $${values.length + 1}`);
			values.push(filters.sender);
		}

		if (conditions.length > 0) {
			queryText += ' WHERE ' + conditions.join(' AND ');
		}

		queryText += ' ORDER BY created_at ASC';

		const result = await db.query(queryText, values);
		return result;
	},

	// Create user message
	async createUserMessage(sessionId, text) {
		const result = await db.query(
			`INSERT INTO experiments (session_id, sender, text) 
                VALUES ($1, 'user', $2) 
                RETURNING *`,
			[sessionId, text]
		);
		return result;
	},

	// Create assistant experiment
	async createAssistantExperiment(sessionId, prompt, parameters, responses) {
		const result = await db.query(
			`INSERT INTO experiments (session_id, sender, prompt, parameters, responses) 
                VALUES ($1, 'assistant', $2, $3, $4) 
                RETURNING *`,
			[sessionId, prompt, JSON.stringify(parameters), JSON.stringify(responses)]
		);
		return result.rows[0];
	},

	// Create experiment with user message in transaction
	async createExperimentWithMessage(sessionId, prompt, parameters, responses) {
		return await db.tx(async client => {
			// Create user message
			const userResult = await client.query(
				`INSERT INTO experiments (session_id, sender, text) 
                    VALUES ($1, 'user', $2) 
                    RETURNING *`,
				[sessionId, prompt]
			);

			// Create assistant experiment
			const experimentResult = await client.query(
				`INSERT INTO experiments (session_id, sender, prompt, parameters, responses) 
                    VALUES ($1, 'assistant', $2, $3, $4) 
                    RETURNING *`,
				[sessionId, prompt, JSON.stringify(parameters), JSON.stringify(responses)]
			);

			// Update session message count and title
			await client.query(
				`UPDATE sessions 
                    SET message_count = message_count + 2 
                    WHERE id = $1`,
				[sessionId]
			);

			// Auto-update title if first message
			const sessionResult = await client.query(
				`UPDATE sessions 
                    SET title = CASE WHEN message_count = 0 AND title LIKE 'Chat %' 
                    THEN $2
                        ELSE title 
                    END
                    WHERE id = $1 RETURNING *`,
				[sessionId, prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')]
			);

			return {
				userMessage: userResult,
				experiment: experimentResult,
				session: sessionResult,
			};
		});
	},

	// Update experiment
	async update(id, updates) {
		const fields = [];
		const values = [];
		let paramCount = 1;

		if (updates.parameters !== undefined) {
			fields.push(`parameters = $${paramCount++}`);
			values.push(JSON.stringify(updates.parameters));
		}
		if (updates.responses !== undefined) {
			fields.push(`responses = $${paramCount++}`);
			values.push(JSON.stringify(updates.responses));
		}
		if (updates.text !== undefined) {
			fields.push(`text = $${paramCount++}`);
			values.push(updates.text);
		}
		if (updates.prompt !== undefined) {
			fields.push(`prompt = $${paramCount++}`);
			values.push(updates.prompt);
		}

		if (fields.length === 0) {
			return await ExperimentModel.findById(id);
		}

		values.push(id);
		const result = await db.query(
			`UPDATE experiments 
                SET ${fields.join(', ')} 
                WHERE id = $${paramCount} 
                RETURNING *`,
			values
		);
		return result.rows[0] || null;
	},

	// Delete experiment
	async delete(id) {
		const result = await db.query(
			'DELETE FROM experiments WHERE id = $1 RETURNING id',
			[id]
		);
		return result.rowCount > 0;
	},

	// Count experiments in session
	async countBySession(sessionId) {
		const result = await db.query(
			'SELECT COUNT(*) FROM experiments WHERE session_id = $1',
			[sessionId]
		);
		return parseInt(result.rows[0].count);
	},
};

export {
    SessionModel,
    ExperimentModel,
    CurrentSessionModel
}