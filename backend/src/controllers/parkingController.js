const db = require('../database/db');

const getOverview = async (req, res) => {
  try {
    const totalSlotsResult = await db.query('SELECT COUNT(*) FROM parking_slots');
    const availableSlotsResult = await db.query("SELECT COUNT(*) FROM parking_slots WHERE status = 'AVAILABLE'");
    const occupiedSlotsResult = await db.query("SELECT COUNT(*) FROM parking_slots WHERE status = 'OCCUPIED'");
    const faultSlotsResult = await db.query("SELECT COUNT(*) FROM parking_slots WHERE status = 'FAULT'");
    
    res.json({
      total: parseInt(totalSlotsResult.rows[0].count),
      available: parseInt(availableSlotsResult.rows[0].count),
      occupied: parseInt(occupiedSlotsResult.rows[0].count),
      faults: parseInt(faultSlotsResult.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFloors = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM parking_floors ORDER BY floor_number');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSlotsByFloor = async (req, res) => {
  try {
    const { floorId } = req.params;
    const result = await db.query('SELECT * FROM parking_slots WHERE floor_id = $1 ORDER BY slot_number', [floorId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const simulateStatus = async (req, res) => {
  try {
    const { slot_id, status } = req.body;
    
    const slotResult = await db.query('SELECT * FROM parking_slots WHERE slot_number = $1', [slot_id]);
    
    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    const slot = slotResult.rows[0];
    
    if (slot.status !== status) {
      await db.query('UPDATE parking_slots SET status = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2', [status, slot.id]);
      
      await db.query(
        'INSERT INTO sensor_events (slot_id, sensor_id, previous_status, new_status) VALUES ($1, $2, $3, $4)',
        [slot.id, slot.sensor_id, slot.status, status]
      );
      
      if (req.io) {
        req.io.emit('slot_update', {
          slot_id: slot.slot_number,
          floor_id: slot.floor_id,
          status: status,
          previous_status: slot.status,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    res.json({ success: true, message: `Slot ${slot_id} updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT se.id, se.previous_status, se.new_status, se.timestamp, ps.slot_number 
      FROM sensor_events se
      JOIN parking_slots ps ON se.slot_id = ps.id
      ORDER BY se.timestamp DESC LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverview,
  getFloors,
  getSlotsByFloor,
  simulateStatus,
  getEvents
};
