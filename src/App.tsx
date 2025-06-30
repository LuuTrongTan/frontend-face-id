import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import RegisterFace from './pages/RegisterFace.tsx';
import ImageRecognition from './pages/ImageRecognition.tsx';
import VideoRecognition from './pages/VideoRecognition.tsx';
import LogManagement from './pages/LogManagement.tsx';
import DeviceStatus from './pages/DeviceStatus.tsx';
import RegisterAccount from './pages/RegisterAccount.tsx';

// Create a client
const queryClient = new QueryClient();

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// HOC để bảo vệ các route cần đăng nhập
function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Nếu route yêu cầu quyền admin
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/register-face" element={<PrivateRoute><RegisterFace /></PrivateRoute>} />
          <Route path="/image-recognition" element={<PrivateRoute><ImageRecognition /></PrivateRoute>} />
          <Route path="/video-recognition" element={<PrivateRoute><VideoRecognition /></PrivateRoute>} />
          <Route path="/device-status" element={<PrivateRoute adminOnly><DeviceStatus /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute adminOnly><LogManagement /></PrivateRoute>} />
          <Route path="/register-account" element={<PrivateRoute adminOnly><RegisterAccount /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
