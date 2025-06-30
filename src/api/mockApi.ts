// Mock data cho ứng dụng
export const mockUsers = [
  { id: 1, username: 'admin', name: 'Administrator', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'user1', name: 'User One', role: 'user', email: 'user1@example.com' },
  { id: 3, username: 'user2', name: 'User Two', role: 'user', email: 'user2@example.com' }
];

export const mockDevices = [
  { id: 1, name: 'Camera 1', status: 'online', location: 'Main Entrance', lastActive: '2023-11-01T08:30:00' },
  { id: 2, name: 'Camera 2', status: 'offline', location: 'Side Door', lastActive: '2023-10-31T17:45:00' },
  { id: 3, name: 'Camera 3', status: 'online', location: 'Parking Lot', lastActive: '2023-11-01T09:15:00' }
];

export const mockLogs = [
  { id: 1, timestamp: '2023-11-01T08:35:22', event: 'Face Recognition', user: 'User One', confidence: 0.95, status: 'Success' },
  { id: 2, timestamp: '2023-11-01T09:12:07', event: 'Face Recognition', user: 'Unknown', confidence: 0.45, status: 'Failed' },
  { id: 3, timestamp: '2023-11-01T10:05:33', event: 'Face Registration', user: 'User Two', confidence: 0.98, status: 'Success' },
  { id: 4, timestamp: '2023-11-01T11:23:15', event: 'System Start', user: 'Admin', confidence: null, status: 'Info' }
];

export const mockFaces = [
  { id: 1, userId: 2, imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg', createdAt: '2023-10-15T14:30:00' },
  { id: 2, userId: 3, imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg', createdAt: '2023-10-20T09:45:00' }
];

// Delay function để tạo độ trễ giống API thật
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 