-- Database schema for AEGIS

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_ledger (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id),
    file_url VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL, -- For cryptographic verification
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    location_lat DECIMAL(9,6) NOT NULL,
    location_lng DECIMAL(9,6) NOT NULL,
    radius_meters INT NOT NULL,
    risk_level INT NOT NULL, -- 1 to 10
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_trust (
    user_id INT PRIMARY KEY,
    trust_score INT DEFAULT 50, -- 0 to 100
    reports_verified INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
