-- Seed data for PARKORA

-- 1. Create users
-- password is 'password123' (bcrypt hash of 'password123')
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@parkora.com', '$2a$10$X9t3w5c338hZ4V/V7lC.2u/j7qAOfx1z9k.fO8rR9w.aKx3k3oO.y', 'ADMIN'),
('Security Staff', 'security@parkora.com', '$2a$10$X9t3w5c338hZ4V/V7lC.2u/j7qAOfx1z9k.fO8rR9w.aKx3k3oO.y', 'SECURITY');

-- 2. Create floors
INSERT INTO parking_floors (floor_number, name) VALUES 
(1, 'Floor 1'),
(2, 'Floor 2');

-- 3. Create slots for Floor 1 (8 slots: A01 to A08)
INSERT INTO parking_slots (floor_id, slot_number, sensor_id, status) VALUES 
(1, 'A01', 'SENSOR_A01', 'AVAILABLE'),
(1, 'A02', 'SENSOR_A02', 'AVAILABLE'),
(1, 'A03', 'SENSOR_A03', 'AVAILABLE'),
(1, 'A04', 'SENSOR_A04', 'AVAILABLE'),
(1, 'A05', 'SENSOR_A05', 'AVAILABLE'),
(1, 'A06', 'SENSOR_A06', 'AVAILABLE'),
(1, 'A07', 'SENSOR_A07', 'AVAILABLE'),
(1, 'A08', 'SENSOR_A08', 'AVAILABLE');

-- 4. Create slots for Floor 2 (8 slots: B01 to B08)
INSERT INTO parking_slots (floor_id, slot_number, sensor_id, status) VALUES 
(2, 'B01', 'SENSOR_B01', 'AVAILABLE'),
(2, 'B02', 'SENSOR_B02', 'AVAILABLE'),
(2, 'B03', 'SENSOR_B03', 'AVAILABLE'),
(2, 'B04', 'SENSOR_B04', 'AVAILABLE'),
(2, 'B05', 'SENSOR_B05', 'AVAILABLE'),
(2, 'B06', 'SENSOR_B06', 'AVAILABLE'),
(2, 'B07', 'SENSOR_B07', 'AVAILABLE'),
(2, 'B08', 'SENSOR_B08', 'AVAILABLE');

-- 5. Insert system init event
INSERT INTO system_events (event_type, message) VALUES 
('SYSTEM_START', 'System initialized with seed data.');
