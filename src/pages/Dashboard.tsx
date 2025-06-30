import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Layout from '../components/Layout/Layout';
import { getDevices } from '../api/deviceApi';
import { getLogStatistics } from '../api/logApi';
import type { Device } from '../api/deviceApi';
import '../styles/PageContent.css';
import '../styles/Dashboard.css';

// Đăng ký Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Khai báo interface cho dữ liệu thống kê
interface LogStats {
  dates: string[];
  counts: {
    info: number[];
    warning: number[];
    error: number[];
  };
}

const Dashboard = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [logStats, setLogStats] = useState<LogStats>({ dates: [], counts: { info: [], warning: [], error: [] } });
  const [recognitionStats] = useState({ 
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    successCount: [65, 78, 90, 81, 56, 55, 40],
    failCount: [12, 19, 10, 5, 8, 7, 9]
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Lấy trạng thái thiết bị
        const deviceData = await getDevices();
        setDevices(deviceData);
        
        // Lấy thống kê logs
        const logStatsData = await getLogStatistics('week');
        
        // Xử lý dữ liệu logs (giả định cấu trúc dữ liệu)
        const formattedLogStats: LogStats = {
          dates: logStatsData.dates || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          counts: {
            info: logStatsData.info || [23, 34, 45, 56, 39, 28, 41],
            warning: logStatsData.warning || [12, 18, 15, 9, 12, 5, 8],
            error: logStatsData.error || [5, 2, 4, 1, 3, 2, 1]
          }
        };
        
        setLogStats(formattedLogStats);
        
        // Thực tế sẽ lấy dữ liệu thống kê nhận diện từ API
        // Dữ liệu mock cho UI demo
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Cấu hình biểu đồ logs
  const logChartData = {
    labels: logStats.dates,
    datasets: [
      {
        label: 'Thông tin',
        data: logStats.counts.info,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Cảnh báo',
        data: logStats.counts.warning,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      },
      {
        label: 'Lỗi',
        data: logStats.counts.error,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  // Cấu hình biểu đồ nhận diện
  const recognitionChartData = {
    labels: recognitionStats.labels,
    datasets: [
      {
        label: 'Nhận diện thành công',
        data: recognitionStats.successCount,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Nhận diện thất bại',
        data: recognitionStats.failCount,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const getTotalDevicesByStatus = () => {
    const total = devices.length;
    const online = devices.filter(device => device.status === 'online').length;
    const offline = devices.filter(device => device.status === 'offline').length;
    const error = devices.filter(device => device.status === 'error').length;
    
    return { total, online, offline, error };
  };
  
  const deviceStats = getTotalDevicesByStatus();
  
  return (
    <Layout>
      <div className="dashboard-container">
        <h1 className="page-title">Tổng quan hệ thống</h1>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Thẻ thống kê */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3 className="stat-title">Tổng số thiết bị</h3>
                <p className="stat-value">{deviceStats.total}</p>
                <div className="stat-details">
                  <span className="text-success">Online: {deviceStats.online}</span>
                  <span className="text-danger">Offline: {deviceStats.offline}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Nhận diện hôm nay</h3>
                <p className="stat-value">154</p>
                <div className="stat-details">
                  <span className="text-success">Tỷ lệ thành công: 92%</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Người dùng đã đăng ký</h3>
                <p className="stat-value">45</p>
                <div className="stat-details">
                  <span className="text-success">+3 trong tuần này</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Logs hệ thống</h3>
                <p className="stat-value">1,283</p>
                <div className="stat-details">
                  <span className="text-danger">5 lỗi mới</span>
                </div>
              </div>
            </div>
            
            {/* Biểu đồ */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Thống kê nhận diện</h3>
                <Bar 
                  data={recognitionChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: false }
                    }
                  }}
                />
              </div>
              
              <div className="chart-card">
                <h3 className="chart-title">Thống kê logs</h3>
                <Line 
                  data={logChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: false }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Thiết bị gần đây */}
            <div className="table-card">
              <h3 className="chart-title">Trạng thái thiết bị</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên thiết bị</th>
                      <th>ID</th>
                      <th>Trạng thái</th>
                      <th>Vị trí</th>
                      <th>Hoạt động cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.slice(0, 5).map((device) => (
                      <tr key={device.device_id}>
                        <td className="font-medium">{device.name}</td>
                        <td>{device.device_id}</td>
                        <td>
                          <span className={`badge ${
                            device.status === 'online' ? 'badge-success' : 
                            device.status === 'offline' ? 'badge-secondary' : 
                            'badge-danger'}`}>
                            {device.status === 'online' ? 'Hoạt động' : 
                              device.status === 'offline' ? 'Ngoại tuyến' : 'Lỗi'}
                          </span>
                        </td>
                        <td>{device.location}</td>
                        <td>{device.last_active}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard; 