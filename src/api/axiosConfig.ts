import axios from 'axios';

// Cấu hình để chuyển đổi giữa API thực và API giả lập
export const USE_MOCK_API = true;

// Tạo instance axios
const API = axios.create({
  baseURL: 'http://localhost:5000', // Đây là URL của backend Python
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor cho request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xử lý khi token hết hạn
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API; 