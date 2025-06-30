import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { getLogs, clearLogs, exportLogs } from '../api/logApi';
import type { LogEntry, LogFilter } from '../api/logApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const LogManagement = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  
  // Filters
  const [filter, setFilter] = useState<LogFilter>({
    level: undefined,
    service: undefined,
    searchText: '',
    startDate: undefined,
    endDate: undefined,
  });
  
  // Options for select fields
  const logLevels = ['info', 'warning', 'error', 'debug'];
  const services = ['authentication', 'face_recognition', 'database', 'device_monitor', 'api'];
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, filter]);
  
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getLogs({
        ...filter,
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      });
      
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('Lỗi khi tải logs:', error);
      setError('Không thể tải logs. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportLogs = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      await exportLogs(filter);
      // Không cần xử lý kết quả vì API sẽ tải file xuống trực tiếp
    } catch (error) {
      console.error('Lỗi khi xuất logs:', error);
      setError('Không thể xuất logs. Vui lòng thử lại sau.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleClearLogs = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả logs đã lọc? Hành động này không thể hoàn tác.')) {
      return;
    }
    
    setIsClearing(true);
    setError(null);
    
    try {
      await clearLogs(filter);
      setLogs([]);
      setTotalLogs(0);
    } catch (error) {
      console.error('Lỗi khi xóa logs:', error);
      setError('Không thể xóa logs. Vui lòng thử lại sau.');
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleFilterChange = (key: keyof LogFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi filter
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi });
    } catch {
      return timestamp;
    }
  };
  
  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'level-info';
      case 'warning':
        return 'level-warning';
      case 'error':
        return 'level-error';
      case 'debug':
        return 'level-debug';
      default:
        return 'level-debug';
    }
  };
  
  // Tính toán tổng số trang
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  
  return (
    <Layout>
      <div className="logs-container">
        <div className="logs-header">
          <h1>Quản lý Logs</h1>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Filter Panel */}
        <div className="filter-panel">
          <h2 className="filter-panel-title">Lọc Logs</h2>
          
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="level" className="filter-label">
                Mức độ
              </label>
              <select
                id="level"
                value={filter.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                {logLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="service" className="filter-label">
                Dịch vụ
              </label>
              <select
                id="service"
                value={filter.service || ''}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="startDate" className="filter-label">
                Từ ngày
              </label>
              <input
                type="date"
                id="startDate"
                value={filter.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="filter-date"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate" className="filter-label">
                Đến ngày
              </label>
              <input
                type="date"
                id="endDate"
                value={filter.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="filter-date"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="searchText" className="filter-label">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="searchText"
              placeholder="Tìm kiếm theo nội dung log..."
              value={filter.searchText || ''}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-buttons">
            <button
              onClick={fetchLogs}
              className="filter-button btn-apply"
            >
              Áp dụng
            </button>
            
            <button
              onClick={() => {
                setFilter({
                  level: undefined,
                  service: undefined,
                  searchText: '',
                  startDate: undefined,
                  endDate: undefined,
                });
                setCurrentPage(1);
              }}
              className="filter-button btn-reset"
            >
              Reset
            </button>
            
            <button
              onClick={handleExportLogs}
              disabled={isExporting || logs.length === 0}
              className={`filter-button btn-export ${logs.length === 0 ? 'btn-disabled' : ''}`}
            >
              {isExporting ? 'Đang xuất...' : 'Xuất CSV'}
            </button>
            
            <button
              onClick={handleClearLogs}
              disabled={isClearing || logs.length === 0}
              className={`filter-button btn-delete ${logs.length === 0 ? 'btn-disabled' : ''}`}
            >
              {isClearing ? 'Đang xóa...' : 'Xóa logs'}
            </button>
          </div>
        </div>
        
        {/* Logs Table */}
        <div className="logs-table-container">
          <div className="logs-table-header">
            <h2 className="logs-table-title">Danh sách logs</h2>
            <p className="logs-table-count">Tổng số: {totalLogs} logs</p>
          </div>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="no-logs">
              Không có logs nào phù hợp với điều kiện lọc
            </div>
          ) : (
            <div className="table-responsive">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Mức độ</th>
                    <th>Dịch vụ</th>
                    <th>Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>
                        <span className={`log-level ${getLogLevelClass(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td>{log.service}</td>
                      <td>
                        <div className="log-message">
                          {log.message}
                          {log.details && (
                            <div className="log-details">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-mobile">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`pagination-button ${currentPage === 1 ? 'pagination-disabled' : ''}`}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`pagination-button ${currentPage === totalPages ? 'pagination-disabled' : ''}`}
                >
                  Sau
                </button>
              </div>
              
              <div className="pagination-desktop">
                <div className="pagination-info">
                  Hiển thị <span>{logs.length > 0 ? (currentPage - 1) * logsPerPage + 1 : 0}</span>{' '}
                  đến <span>{Math.min(currentPage * logsPerPage, totalLogs)}</span>{' '}
                  trong <span>{totalLogs}</span> kết quả
                </div>
                
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`pagination-button ${currentPage === 1 ? 'pagination-disabled' : ''}`}
                    aria-label="Trang trước"
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate page numbers to show (simplified pagination)
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-button ${currentPage === pageNum ? 'pagination-active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`pagination-button ${currentPage === totalPages ? 'pagination-disabled' : ''}`}
                    aria-label="Trang sau"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LogManagement; 