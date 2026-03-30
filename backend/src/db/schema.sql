-- Enable PostGIS extension for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Complaints table with geometry for heatmap support
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    risk_level VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    evidence_hash VARCHAR(64),
    certificate_id VARCHAR(64),
    reported_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index for fast heatmap queries
CREATE INDEX IF NOT EXISTS complaints_geom_idx 
    ON complaints USING GIST(geom);

-- Evidence ledger (append-only, tamper-proof)
CREATE TABLE IF NOT EXISTS evidence_ledger (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id),
    hash VARCHAR(255) NOT NULL,
    certificate_id VARCHAR(64) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Risk zones for the heatmap
CREATE TABLE IF NOT EXISTS risk_zones (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    radius_meters INT NOT NULL,
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User trust scores (anonymous)
CREATE TABLE IF NOT EXISTS user_trust (
    user_id VARCHAR(64) PRIMARY KEY,
    trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
    reports_submitted INT DEFAULT 0,
    reports_verified INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);