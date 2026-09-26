require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const parkingRoutes = require('./routes/parkingRoutes');
const mqttClient = require('./mqtt/client');
const db = require('./database/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', parkingRoutes);

// Add io to req object so routes can broadcast
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected to WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Pass io to MQTT client for broadcasting
mqttClient.init(io);

// Basic health check
app.get('/api/system/status', (req, res) => {
  res.json({ status: 'OK', message: 'PARKORA Backend is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
