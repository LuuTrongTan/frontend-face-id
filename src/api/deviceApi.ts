import API, { USE_MOCK_API } from './axiosConfig';
import { delay } from './mockApi';

export interface Device {
  device_id: string;
  name: string;
  location: string;
  status: string;
  last_active: string;
  last_image_url: string | null;
}

export interface DeviceStatus {
  status: string;
  last_active: string;
}

// Mock devices cho giao diện
const mockDeviceData: Device[] = [
  {
    device_id: '1',
    name: 'Camera Entrance',
    location: 'Main Entrance',
    status: 'online',
    last_active: '2023-11-01T08:30:00',
    last_image_url: 'https://placehold.co/300x200?text=Camera+1'
  },
  {
    device_id: '2',
    name: 'Camera Side Door',
    location: 'Side Door',
    status: 'offline',
    last_active: '2023-10-31T17:45:00',
    last_image_url: null
  },
  {
    device_id: '3',
    name: 'Camera Parking',
    location: 'Parking Lot',
    status: 'online',
    last_active: '2023-11-01T09:15:00',
    last_image_url: 'https://placehold.co/300x200?text=Camera+3'
  }
];

// Mock system metrics
const generateMockMetrics = (_deviceId: number, points: number): SystemMetrics[] => {
  const metrics: SystemMetrics[] = [];
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (points - i));
    
    metrics.push({
      cpu_usage: 20 + Math.random() * 40, // 20-60%
      memory_usage: 30 + Math.random() * 30, // 30-60%
      disk_usage: 40 + Math.random() * 20, // 40-60%
      temperature: 35 + Math.random() * 15, // 35-50 celsius
      timestamp: timestamp.toISOString()
    });
  }
  
  return metrics;
};

export const getDevices = async (): Promise<Device[]> => {
  if (USE_MOCK_API) {
    await delay(600);
    return mockDeviceData;
  }
  
  const response = await API.get('/devices');
  return response.data;
};

export const getDeviceById = async (deviceId: string): Promise<Device> => {
  if (USE_MOCK_API) {
    await delay(400);
    const device = mockDeviceData.find(d => d.device_id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    return device;
  }
  
  const response = await API.get(`/devices/${deviceId}`);
  return response.data;
};

export const updateDeviceStatus = async (deviceId: string, status: string): Promise<Device> => {
  if (USE_MOCK_API) {
    await delay(500);
    const device = mockDeviceData.find(d => d.device_id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    
    device.status = status;
    device.last_active = new Date().toISOString();
    
    return device;
  }
  
  const response = await API.put(`/devices/${deviceId}/status`, { status });
  return response.data;
};

export const getDeviceStatistics = async (): Promise<{
  total: number;
  online: number;
  offline: number;
  error: number;
}> => {
  if (USE_MOCK_API) {
    await delay(300);
    
    const online = mockDeviceData.filter(d => d.status === 'online').length;
    const offline = mockDeviceData.filter(d => d.status === 'offline').length;
    const error = mockDeviceData.filter(d => d.status === 'error').length;
    
    return {
      total: mockDeviceData.length,
      online,
      offline,
      error
    };
  }
  
  const response = await API.get('/devices/statistics');
  return response.data;
};

export interface SystemMetrics {
  cpu_usage: number; // percentage
  memory_usage: number; // percentage
  disk_usage: number; // percentage
  temperature: number; // celsius
  timestamp: string;
}

export const getSystemMetrics = async (deviceId: number, timeRange: 'hour' | 'day' | 'week' = 'hour') => {
  if (USE_MOCK_API) {
    await delay(800);
    
    let points = 60; // Default hour
    if (timeRange === 'day') points = 24;
    if (timeRange === 'week') points = 7;
    
    return generateMockMetrics(deviceId, points);
  }
  
  return API.get<SystemMetrics[]>(`/devices/${deviceId}/metrics`, {
    params: { time_range: timeRange }
  }).then(response => response.data);
};

export const restartDevice = async (deviceId: number) => {
  if (USE_MOCK_API) {
    await delay(1500); // Longer delay for restart operation
    return { success: true, message: 'Device restarted successfully' };
  }
  
  return API.post(`/devices/${deviceId}/restart`)
    .then(response => response.data);
};

export const pingDevice = async (deviceId: number) => {
  if (USE_MOCK_API) {
    await delay(400);
    const device = mockDeviceData.find(d => d.device_id === String(deviceId));
    const status = device?.status === 'online' ? 'success' : 'failed';
    
    return { 
      status,
      latency: device?.status === 'online' ? Math.floor(Math.random() * 50) + 10 : null
    };
  }
  
  return API.get(`/devices/${deviceId}/ping`)
    .then(response => response.data);
}; 