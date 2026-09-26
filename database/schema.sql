-- PostgreSQL Schema for PARKORA

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SECURITY', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_floors (
    id SERIAL PRIMARY KEY,
    floor_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_slots (
    id SERIAL PRIMARY KEY,
    floor_id INT REFERENCES parking_floors(id) ON DELETE CASCADE,
    slot_number VARCHAR(50) NOT NULL,
    sensor_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'FAULT')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, slot_number)
);

CREATE TABLE sensor_events (
    id SERIAL PRIMARY KEY,
    slot_id INT REFERENCES parking_slots(id) ON DELETE SET NULL,
    sensor_id VARCHAR(100),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_sessions (
    id SERIAL PRIMARY KEY,
    slot_id INT REFERENCES parking_slots(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INT
);
