const mqtt = require('mqtt');

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

// List of available slots
const slots = [
  { id: 'A01', floor: 1, sensor: 'SENSOR_A01' },
  { id: 'A02', floor: 1, sensor: 'SENSOR_A02' },
  { id: 'A03', floor: 1, sensor: 'SENSOR_A03' },
  { id: 'A04', floor: 1, sensor: 'SENSOR_A04' },
  { id: 'B01', floor: 2, sensor: 'SENSOR_B01' },
  { id: 'B02', floor: 2, sensor: 'SENSOR_B02' },
  { id: 'B03', floor: 2, sensor: 'SENSOR_B03' },
  { id: 'B04', floor: 2, sensor: 'SENSOR_B04' },
];

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${brokerUrl}`);
  console.log('PARKORA Sensor Simulator is running...');
  
  // Publish random events every 5-10 seconds
  setInterval(simulateRandomEvent, Math.random() * 5000 + 5000);
});

function simulateRandomEvent() {
  const randomSlot = slots[Math.floor(Math.random() * slots.length)];
  const status = Math.random() > 0.5 ? 'OCCUPIED' : 'AVAILABLE';
  
  const payload = {
    slot_id: randomSlot.id,
    sensor_id: randomSlot.sensor,
    status: status,
    timestamp: new Date().toISOString()
  };
  
  const topic = `parkora/floor${randomSlot.floor}/slot/${randomSlot.id}`;
  
  client.publish(topic, JSON.stringify(payload), (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
    } else {
      console.log(`[${randomSlot.id}] → ${status}`);
    }
  });
}

client.on('error', (err) => {
  console.error('MQTT Client Error:', err);
});
