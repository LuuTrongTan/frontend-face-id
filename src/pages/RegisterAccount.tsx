import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { registerAccount, getAllAccounts, deleteAccount } from '../api/authApi';
import '../styles/PageContent.css';
import '../styles/RegisterAccount.css';

interface Account {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface PermissionsData {
  can_register_faces: boolean;
  can_view_recognition: boolean;
  can_view_logs: boolean;
  can_manage_users: boolean;
}

const RegisterAccount = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [permissions, setPermissions] = useState<PermissionsData>({
    can_register_faces: true,
    can_view_recognition: true,
    can_view_logs: false,
    can_manage_users: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setMessage({
          text: 'Không thể tải danh sách tài khoản',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setMessage({
        text: 'Mật khẩu và xác nhận mật khẩu không khớp',
        type: 'error'
      });
      return;
    }
    
    if (password.length < 6) {
      setMessage({
        text: 'Mật khẩu phải có ít nhất 6 ký tự',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await registerAccount({
        username,
        name,
        password,
        role,
        permissions
      });
      
      setMessage({
        text: 'Đăng ký tài khoản thành công!',
        type: 'success'
      });
      
      // Add new account to the list
      if (response) {
        setAccounts([...accounts, {
          id: response.id || accounts.length + 1,
          username,
          name,
          role
        }]);
      }
      
      // Reset form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setRole('user');
      setPermissions({
        can_register_faces: true,
        can_view_recognition: true,
        can_view_logs: false,
        can_manage_users: false
      });
      
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      setMessage({
        text: 'Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này không?')) {
      try {
        await deleteAccount(id);
        setAccounts(accounts.filter(account => account.id !== id));
        setMessage({
          text: 'Xóa tài khoản thành công',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting account:', error);
        setMessage({
          text: 'Xóa tài khoản thất bại',
          type: 'error'
        });
      }
    }
  };

  const handlePermissionChange = (key: keyof PermissionsData) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });
  };

  return (
    <Layout>
      <div className="register-account-container">
        <h1 className="page-title">Đăng ký tài khoản</h1>
        
        {message && (
          <div className={`message ${message.type}`}>
            <i className={message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
            {message.text}
          </div>
        )}
        
        <div className="register-form-container">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <i className="fas fa-user"></i>
                Tài khoản
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className="fas fa-id-card"></i>
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i>
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fas fa-key"></i>
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                <i className="fas fa-user-tag"></i>
                Vai trò
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select"
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">
                <i className="fas fa-shield-alt"></i>
                Quyền hạn
              </label>
              <div className="permissions-grid">
                <label className="permission-item">
                  <input
                    type="checkbox"
                    checked={permissions.can_register_faces}
                    onChange={() => handlePermissionChange('can_register_faces')}
                    className="permission-checkbox"
                  />
                  <span>Đăng ký khuôn mặt</span>
                </label>
                
                <label className="permission-item">
                  <input
                    type="checkbox"
                    checked={permissions.can_view_recognition}
                    onChange={() => handlePermissionChange('can_view_recognition')}
                    className="permission-checkbox"
                  />
                  <span>Xem nhận diện</span>
                </label>
                
                <label className="permission-item">
                  <input
                    type="checkbox"
                    checked={permissions.can_view_logs}
                    onChange={() => handlePermissionChange('can_view_logs')}
                    className="permission-checkbox"
                  />
                  <span>Xem logs</span>
                </label>
                
                <label className="permission-item">
                  <input
                    type="checkbox"
                    checked={permissions.can_manage_users}
                    onChange={() => handlePermissionChange('can_manage_users')}
                    className="permission-checkbox"
                  />
                  <span>Quản lý người dùng</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  <span>Đăng ký</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="accounts-list">
          <h2 className="page-title">Danh sách tài khoản</h2>
          
          {isLoading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : accounts.length === 0 ? (
            <div className="empty-message">Chưa có tài khoản nào</div>
          ) : (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tài khoản</th>
                  <th>Họ và tên</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr key={account.id}>
                    <td>{index + 1}</td>
                    <td>{account.username}</td>
                    <td>{account.name}</td>
                    <td>
                      <span className={`role-badge ${account.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {account.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RegisterAccount; 