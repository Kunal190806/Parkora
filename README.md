# PARKORA - Smart IoT-Based Parking Management System

## Overview
PARKORA is an IoT-based smart parking management system built for multi-floor parking facilities. It provides real-time monitoring of parking slots via simulated (or actual ESP32) hardware.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **IoT Communication**: MQTT
- **Real-Time Updates**: WebSocket (Socket.IO)

## Installation

### Prerequisites
1. Node.js (v18+)
2. PostgreSQL
3. MQTT Broker (e.g., Mosquitto)

### 1. Database Setup
1. Create a PostgreSQL database named `parkora`
2. Run the SQL scripts in the `database/` folder:
   ```bash
   psql -U postgres -d parkora -f database/schema.sql
   psql -U postgres -d parkora -f database/seed.sql
   ```

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure .env is correct for your local setup
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Simulator Setup (Demo Mode)
If you don't have physical ESP32 sensors, run the simulator:
```bash
cd simulator
npm install
node sensor-simulator.js
```

## Features
- Real-time slot status monitoring
- Driver guidance to the nearest available slot
- Live event logging
- Sensor simulation mode

This MVP meets all college project requirements.
