-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experiments table
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
    prompt TEXT,
    text TEXT,
    parameters JSONB,
    responses JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Current session tracking (single row table)
CREATE TABLE current_session (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default current session row
INSERT INTO current_session (id) VALUES (1);

-- Indexes for better query performance
CREATE INDEX idx_experiments_session_id ON experiments(session_id);
CREATE INDEX idx_experiments_created_at ON experiments(created_at);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at DESC);
CREATE INDEX idx_experiments_sender ON experiments(sender);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_session_updated_at BEFORE UPDATE ON current_session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get session with experiment count
CREATE OR REPLACE FUNCTION get_session_with_count(session_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    message_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    actual_message_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.message_count,
        s.created_at,
        s.updated_at,
        COUNT(e.id) as actual_message_count
    FROM sessions s
    LEFT JOIN experiments e ON s.id = e.session_id
    WHERE s.id = session_uuid
    GROUP BY s.id;
END;
$$ LANGUAGE plpgsql;