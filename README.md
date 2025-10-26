# Chat Experiments API

Express-based REST API for managing chat sessions and experiments with built-in error handling, rate limiting, and retry logic.

## 🚀 Quick Start

### Server Setup

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Create `.env` file:**
```env
PORT=3001
NODE_ENV=development
```

3. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs at `http://localhost:3001`

### Client Setup

1. **Create `.env.local` in your Next.js project:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. **Replace the database utility:**
Replace your `@/utils/database.js` with the new `api_client.js`

## 📡 API Endpoints

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get all sessions |
| GET | `/api/sessions/current` | Get current active session |
| POST | `/api/sessions` | Create new session |
| PUT | `/api/sessions/:id` | Update session title |
| PUT | `/api/sessions/:id/current` | Set as current session |
| DELETE | `/api/sessions/:id` | Delete session |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | Get experiments (optional ?sessionId) |
| GET | `/api/experiments/:id` | Get single experiment |
| POST | `/api/experiments` | Create new experiment |
| PUT | `/api/experiments/:id` | Update experiment |
| DELETE | `/api/experiments/:id` | Delete experiment |

## 🛡️ Error Handling

### Client-Side

The API client automatically handles:
- **Network failures** - Retries up to 3 times with exponential backoff
- **Rate limiting** - Returns user-friendly error messages
- **Invalid inputs** - Validates before sending requests
- **Server errors** - Graceful fallbacks with error logging

Example usage with error handling:
```javascript
import { simulateApiCall, APIError } from '@/utils/database';

try {
  const result = await simulateApiCall(prompt, params);
  // Handle success
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 429) {
      // Rate limit exceeded
      showToast('Too many requests. Please slow down.');
    } else if (error.status === 400) {
      // Validation error
      showToast(error.message);
    } else {
      // Other API errors
      showToast('Something went wrong. Please try again.');
    }
  } else {
    // Network or other errors
    showToast('Network error. Check your connection.');
  }
}
```

### Server-Side

The server implements:
- **Rate limiting**: 100 requests per 15 minutes per IP
- **Experiment rate limiting**: 10 experiments per minute per IP
- **Input validation**: All inputs validated before processing
- **Global error handler**: Catches and formats all errors
- **404 handler**: Returns proper error for unknown routes

## 🔒 Rate Limits

- **General API**: 100 requests / 15 minutes per IP
- **Experiments**: 10 creations / minute per IP

When rate limited, the API returns:
```json
{
  "error": "Too many requests, please try again later."
}
```

## 📊 Response Formats

### Success Response
```json
{
  "session": {
    "id": "uuid",
    "title": "Chat title",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp",
    "messageCount": 0
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {} // Optional additional info
}
```

## 🔄 Migration from localStorage

The new API client is a drop-in replacement. No code changes needed in your components!

**Before:**
```javascript
import { getExperiments } from '@/utils/database'; // localStorage version
```

**After:**
```javascript
import { getExperiments } from '@/utils/database'; // API version
```

All function signatures remain the same.

## 🏗️ Production Considerations

For production, replace in-memory storage with:

### PostgreSQL Example
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Replace db object with actual queries
app.get('/api/sessions', async (req, res) => {
  const result = await pool.query('SELECT * FROM sessions ORDER BY updated_at DESC');
  res.json({ sessions: result.rows });
});
```

### MongoDB Example
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();
const db = client.db('chat-experiments');
const sessions = db.collection('sessions');
```

## 🧪 Testing

Test the API with curl:

```bash
# Create session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Session"}'

# Get all sessions
curl http://localhost:3001/api/sessions

# Create experiment
curl -X POST http://localhost:3001/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test prompt",
    "parameters": {
      "temperature": 0.7,
      "topP": 0.9,
      "maxTokens": 1000
    }
  }'
```

## 📝 Health Check

```bash
curl http://localhost:3001/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00.000Z"
}
```