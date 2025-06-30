import API, { USE_MOCK_API } from './axiosConfig';
import { delay } from './mockApi';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  service: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LogFilter {
  level?: string;
  service?: string;
  searchText?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
}

// Giả lập logs
const mockLogEntries: LogEntry[] = [
  {
    id: 1,
    timestamp: '2023-11-01T08:35:22',
    level: 'INFO',
    service: 'AuthService',
    message: 'User login successful',
    details: { username: 'admin', ip: '192.168.1.100' }
  },
  {
    id: 2,
    timestamp: '2023-11-01T09:12:07',
    level: 'ERROR',
    service: 'FaceRecognition',
    message: 'Recognition failed - confidence below threshold',
    details: { confidence: 0.45, threshold: 0.7 }
  },
  {
    id: 3,
    timestamp: '2023-11-01T10:05:33',
    level: 'INFO',
    service: 'FaceRegistration',
    message: 'New face registered successfully',
    details: { username: 'user2', faceId: 'face_123456' }
  },
  {
    id: 4,
    timestamp: '2023-11-01T11:23:15',
    level: 'WARNING',
    service: 'System',
    message: 'High CPU usage detected',
    details: { cpuUsage: 89.5, memoryUsage: 76.2 }
  },
  {
    id: 5,
    timestamp: '2023-11-01T12:40:08',
    level: 'ERROR',
    service: 'Camera',
    message: 'Camera connection lost',
    details: { deviceId: 'cam2', location: 'Side Door' }
  },
  {
    id: 6,
    timestamp: '2023-11-01T14:15:50',
    level: 'INFO',
    service: 'System',
    message: 'System backup completed',
    details: { backupSize: '1.2GB', duration: '00:05:32' }
  }
];

export const getLogs = async (filter: LogFilter): Promise<LogsResponse> => {
  if (USE_MOCK_API) {
    await delay(800);
    
    // Lọc logs theo filter
    let filteredLogs = [...mockLogEntries];
    
    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }
    
    if (filter.service) {
      filteredLogs = filteredLogs.filter(log => log.service === filter.service);
    }
    
    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchText) || 
        log.service.toLowerCase().includes(searchText)
      );
    }
    
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Phân trang
    const offset = filter.offset || 0;
    const limit = filter.limit || filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    
    return {
      logs: paginatedLogs,
      total: filteredLogs.length
    };
  }
  
  const response = await API.get('/logs', { params: filter });
  return response.data;
};

export const clearLogs = async (filter: LogFilter): Promise<void> => {
  if (USE_MOCK_API) {
    await delay(500);
    console.log('Mock: Logs cleared with filter', filter);
    return;
  }
  
  await API.delete('/logs', { params: filter });
};

export const exportLogs = async (filter: LogFilter): Promise<void> => {
  if (USE_MOCK_API) {
    await delay(1000);
    
    // Giả lập xuất file CSV
    const header = 'ID,Timestamp,Level,Service,Message\n';
    let csv = header;
    
    mockLogEntries.forEach(log => {
      csv += `${log.id},"${log.timestamp}","${log.level}","${log.service}","${log.message}"\n`;
    });
    
    // Tạo một URL object từ blob và tạo link download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    
    return;
  }
  
  const response = await API.get('/logs/export', {
    params: filter,
    responseType: 'blob'
  });
  
  // Tạo một URL object từ blob và tạo link download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
};

export const getLogStatistics = async (timeRange: 'day' | 'week' | 'month' = 'day') => {
  if (USE_MOCK_API) {
    await delay(700);
    
    // Giả lập thống kê log theo cấp độ
    return {
      info: 12,
      warning: 5,
      error: 3,
      totalLogs: 20,
      serviceDistribution: {
        AuthService: 4,
        FaceRecognition: 8,
        System: 5,
        Camera: 3
      },
      timeDistribution: [
        { hour: '00:00', count: 1 },
        { hour: '06:00', count: 3 },
        { hour: '12:00', count: 10 },
        { hour: '18:00', count: 6 }
      ]
    };
  }
  
  return API.get('/logs/statistics', { params: { time_range: timeRange } })
    .then(response => response.data);
}; 