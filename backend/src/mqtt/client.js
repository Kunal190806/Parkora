const mqtt = require('mqtt');
const db = require('../database/db');

let io = null;

const init = (socketIo) => {
  io = socketIo;
  
  const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
    clientId: 'parkora_backend_' + Math.random().toString(16).substring(2, 8)
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('parkora/+/slot/+', (err) => {
      if (err) {
        console.error('Failed to subscribe to topics', err);
      } else {
        console.log('Subscribed to parkora/+/slot/+');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`Received message on ${topic}:`, payload);
      
      const { slot_id, sensor_id, status, timestamp } = payload;
      
      // Update the database
      const slotResult = await db.query(
        'SELECT * FROM parking_slots WHERE slot_number = $1 OR sensor_id = $2',
        [slot_id, sensor_id]
      );
      
      if (slotResult.rows.length === 0) {
        console.warn(`Unknown slot or sensor: ${slot_id} / ${sensor_id}`);
        return;
      }
      
      const slot = slotResult.rows[0];
      const previousStatus = slot.status;
      
      if (previousStatus !== status) {
        await db.query(
          'UPDATE parking_slots SET status = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2',
          [status, slot.id]
        );
        
        await db.query(
          'INSERT INTO sensor_events (slot_id, sensor_id, previous_status, new_status) VALUES ($1, $2, $3, $4)',
          [slot.id, sensor_id, previousStatus, status]
        );
        
        // Broadcast via WebSocket
        if (io) {
          io.emit('slot_update', {
            slot_id: slot.slot_number,
            floor_id: slot.floor_id,
            status: status,
            previous_status: previousStatus,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Error processing MQTT message:', err);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
  });
};

module.exports = { init };
