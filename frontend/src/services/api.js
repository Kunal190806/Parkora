import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
});

export const getOverview = () => api.get('/parking/overview').then(res => res.data);
export const getFloors = () => api.get('/floors').then(res => res.data);
export const getSlotsByFloor = (floorId) => api.get(`/floors/${floorId}/slots`).then(res => res.data);
export const getLatestEvents = () => api.get('/events/latest').then(res => res.data);
export const simulateSlotStatus = (slotId, status) => api.post('/simulation/slot-status', { slot_id: slotId, status }).then(res => res.data);

export const connectSocket = () => {
  return io(SOCKET_URL);
};
