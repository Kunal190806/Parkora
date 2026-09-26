import { useState, useEffect } from 'react';
import { getOverview, getFloors, getSlotsByFloor, getLatestEvents, connectSocket, simulateSlotStatus } from '../services/api';
import { Activity, Car, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SecurityDashboard() {
  const [overview, setOverview] = useState({ total: 0, available: 0, occupied: 0, faults: 0 });
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [socket, setSocket] = useState(null);

  const loadData = async () => {
    try {
      const ov = await getOverview();
      setOverview(ov);
      
      const fls = await getFloors();
      setFloors(fls);
      if (fls.length > 0 && !selectedFloor) {
        setSelectedFloor(fls[0].id);
      }
      
      const evs = await getLatestEvents();
      setEvents(evs);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  const loadSlots = async (floorId) => {
    if (!floorId) return;
    try {
      const slts = await getSlotsByFloor(floorId);
      setSlots(slts);
    } catch (err) {
      console.error("Error loading slots", err);
    }
  };

  useEffect(() => {
    loadData();
    const newSocket = connectSocket();
    setSocket(newSocket);

    newSocket.on('slot_update', (data) => {
      // Re-fetch overview and events on any change
      getOverview().then(setOverview);
      getLatestEvents().then(setEvents);
      
      // Update slots if the changed slot is on the current floor
      setSlots((prev) => 
        prev.map(slot => 
          slot.slot_number === data.slot_id ? { ...slot, status: data.status, last_updated: data.timestamp } : slot
        )
      );
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    loadSlots(selectedFloor);
  }, [selectedFloor]);

  const recommendedSlot = slots.find(s => s.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="TOTAL SLOTS" value={overview.total} icon={<Activity />} color="text-park-blue" />
        <StatCard title="AVAILABLE" value={overview.available} icon={<CheckCircle2 />} color="text-park-green" />
        <StatCard title="OCCUPIED" value={overview.occupied} icon={<Car />} color="text-park-red" />
        <StatCard title="FAULTS" value={overview.faults} icon={<AlertTriangle />} color="text-park-yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-park-navy">Parking Grid</h2>
              <div className="flex space-x-2">
                {floors.map(floor => (
                  <button
                    key={floor.id}
                    onClick={() => setSelectedFloor(floor.id)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${selectedFloor === floor.id ? 'bg-park-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {floor.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {slots.map(slot => (
                <div 
                  key={slot.id} 
                  className={`p-4 rounded-lg flex flex-col items-center justify-center h-24 border-2 transition-all
                    ${slot.status === 'AVAILABLE' ? 'border-park-green bg-green-50' : 
                      slot.status === 'OCCUPIED' ? 'border-park-red bg-red-50' : 'border-park-yellow bg-yellow-50'}`}
                >
                  <span className="font-bold text-lg text-gray-800">{slot.slot_number}</span>
                  <span className={`text-xs font-semibold mt-1
                    ${slot.status === 'AVAILABLE' ? 'text-park-green' : 
                      slot.status === 'OCCUPIED' ? 'text-park-red' : 'text-park-yellow'}`}>
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hardware Simulation Mode (for demo purposes) */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-park-navy mb-4">Simulation Mode</h2>
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button
                  key={`sim-${slot.id}`}
                  onClick={() => simulateSlotStatus(slot.slot_number, slot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE')}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Toggle {slot.slot_number}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-park-navy mb-2">Driver Guidance</h2>
            {recommendedSlot ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                <p className="text-sm text-green-800 font-medium mb-1">Recommended Available Slot</p>
                <p className="text-3xl font-bold text-park-green">{recommendedSlot.slot_number}</p>
                <p className="text-xs text-green-600 mt-2">Guide driver to this slot</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
                <p className="text-red-800 font-medium">Facility Full</p>
                <p className="text-sm text-red-600 mt-1">No slots available on this floor</p>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-96">
            <h2 className="text-lg font-semibold text-park-navy mb-4">Live Event Log</h2>
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {events.map(event => (
                <div key={event.id} className="flex justify-between items-start border-b border-gray-100 pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Slot {event.slot_number} &rarr; <span className={event.new_status === 'AVAILABLE' ? 'text-park-green' : 'text-park-red'}>{event.new_status}</span>
                    </p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No recent events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value.toString().padStart(2, '0')}</p>
      </div>
      <div className={`p-3 bg-gray-50 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );
}
