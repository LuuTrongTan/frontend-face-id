import { create } from 'zustand';
import type { Device, SystemMetrics } from '../api/deviceApi';
import { getDevices, getSystemMetrics, restartDevice, pingDevice } from '../api/deviceApi';    

interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  metrics: SystemMetrics[];
  isLoading: boolean;
  error: string | null;
  timeRange: 'hour' | 'day' | 'week';
  
  fetchDevices: () => Promise<void>;
  selectDevice: (deviceId: string) => void;
  fetchMetrics: (deviceId: number) => Promise<void>;
  setTimeRange: (range: 'hour' | 'day' | 'week') => void;
  restartDevice: (deviceId: number) => Promise<void>;
  pingDevice: (deviceId: number) => Promise<void>;
}

const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  selectedDevice: null,
  metrics: [],
  isLoading: false,
  error: null,
  timeRange: 'hour',
  
  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const devices = await getDevices();
      set({ devices, isLoading: false });
      
      // Tự động chọn thiết bị đầu tiên nếu chưa có thiết bị nào được chọn
      if (devices.length > 0 && !get().selectedDevice) {
        set({ selectedDevice: devices[0] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải dữ liệu thiết bị';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  selectDevice: (deviceId: string) => {
    const selectedDevice = get().devices.find(device => device.device_id === deviceId) || null;
    set({ selectedDevice });
    
    if (selectedDevice) {
      // Convert string device_id to number for the metrics API
      const numericId = parseInt(selectedDevice.device_id, 10);
      if (!isNaN(numericId)) {
        get().fetchMetrics(numericId);
      }
    }
  },
  
  fetchMetrics: async (deviceId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const metrics = await getSystemMetrics(deviceId, get().timeRange);
      set({ metrics, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải dữ liệu hiệu suất';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  setTimeRange: (range: 'hour' | 'day' | 'week') => {
    set({ timeRange: range });
    
    const { selectedDevice } = get();
    if (selectedDevice) {
      // Convert string device_id to number for the metrics API
      const numericId = parseInt(selectedDevice.device_id, 10);
      if (!isNaN(numericId)) {
        get().fetchMetrics(numericId);
      }
    }
  },
  
  restartDevice: async (deviceId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await restartDevice(deviceId);
      // Cập nhật lại danh sách thiết bị sau khi khởi động lại
      get().fetchDevices();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể khởi động lại thiết bị';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  pingDevice: async (deviceId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await pingDevice(deviceId);
      // Cập nhật lại danh sách thiết bị sau khi ping
      get().fetchDevices();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể ping thiết bị';
      set({ error: errorMessage, isLoading: false });
    }
  }
}));

export default useDeviceStore; 