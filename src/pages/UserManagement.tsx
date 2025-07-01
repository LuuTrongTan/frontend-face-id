import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { getAllFaceUsers, deleteFaceUser } from '../api/faceApi';
import type { FaceUser } from '../api/faceApi';
import '../styles/PageContent.css';

const UserManagement = () => {
  const [users, setUsers] = useState<FaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllFaceUsers();
      setUsers(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setMessage({
        text: 'Không thể tải danh sách người dùng',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }
    
    try {
      await deleteFaceUser(userId);
      setMessage({
        text: 'Xóa người dùng thành công!',
        type: 'success'
      });
      
      // Cập nhật lại danh sách người dùng
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      setMessage({
        text: 'Xóa người dùng thất bại. Vui lòng thử lại.',
        type: 'error'
      });
    }
  };

  // Lọc người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.id.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="container">
        <h1 className="page-title">Quản lý Người dùng</h1>
        
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Danh sách người dùng đã đăng ký</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="btn btn-primary">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p>{searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào được đăng ký'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Ảnh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <div className="user-avatar">
                          <img
                            src={user.face_path}
                            alt={`Ảnh của ${user.name}`}
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement; 