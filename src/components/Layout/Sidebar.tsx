import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

interface SidebarItem {
  title: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { logout, role, username } = useAuthStore();
  
  const menuItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      path: '/',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'Nhận diện Video',
      path: '/video-recognition',
      icon: 'fas fa-video'
    },
    {
      title: 'Nhận diện Ảnh',
      path: '/image-recognition',
      icon: 'fas fa-camera'
    },
    {
      title: 'Đăng ký Khuôn mặt',
      path: '/register-face',
      icon: 'fas fa-user-plus'
    },
    {
      title: 'Trạng thái thiết bị',
      path: '/device-status',
      icon: 'fas fa-tablet-alt',
      adminOnly: true
    },
    {
      title: 'Quản lý Logs',
      path: '/logs',
      icon: 'fas fa-clipboard-list',
      adminOnly: true
    },
    {
      title: 'Đăng ký tài khoản',
      path: '/register-account',
      icon: 'fas fa-user-shield',
      adminOnly: true
    }
  ];
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleMobile = () => {
    setIsOpenMobile(!isOpenMobile);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  // Phân loại menu items theo nhóm
  const userItems = menuItems.filter(item => !item.adminOnly);
  const adminItems = menuItems.filter(item => item.adminOnly);
  
  return (
    <>
      <div className={`mobile-nav-toggle ${isOpenMobile ? 'active' : ''}`} onClick={toggleMobile}>
        <i className={`fas ${isOpenMobile ? 'fa-times' : 'fa-bars'}`}></i>
      </div>
    
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isOpenMobile ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-id-card"></i>
            <span>FaceID AI System</span>
          </div>
          <button className="sidebar-footer-button" onClick={toggleCollapse} title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}>
            <i className={`fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        </div>
        
        <div className="sidebar-menu">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Tổng quan</div>
            <nav>
              {userItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  title={item.title}
                >
                  <span className="sidebar-link-icon">
                    <i className={item.icon}></i>
                  </span>
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          
          {role === 'admin' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Quản trị</div>
              <nav>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    title={item.title}
                  >
                    <span className="sidebar-link-icon">
                      <i className={item.icon}></i>
                    </span>
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            <span>{username || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-footer-button"
            title="Đăng xuất"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 