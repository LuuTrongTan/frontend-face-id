import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { registerFace, getAllFaceUsers, deleteFaceUser } from '../api/faceApi';
import type { FaceUser } from '../api/faceApi';
import '../styles/PageContent.css';
import '../styles/RegisterFace.css';

const RegisterFace = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cccd, setCccd] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [users, setUsers] = useState<FaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    fetchUsers();
    
    // Cleanup camera stream when component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
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
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      
      // Hiển thị preview ảnh
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      setMessage({
        text: 'Vui lòng chọn hoặc chụp ảnh khuôn mặt',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('cccd', cccd);
      formData.append('photo', photo);
      
      await registerFace(formData);
      
      setMessage({
        text: 'Đăng ký khuôn mặt thành công!',
        type: 'success'
      });
      
      // Reset form
      setName('');
      setPhone('');
      setCccd('');
      setPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Cập nhật lại danh sách người dùng
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      setMessage({
        text: 'Đăng ký thất bại. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
  
  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      console.error('Lỗi khi truy cập camera:', err);
      setCameraError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập và thử lại.');
      setCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };
  
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame on the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas content to file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `face_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhoto(file);
            setPhotoPreview(canvas.toDataURL('image/jpeg'));
          }
        }, 'image/jpeg', 0.95);
      }
    }
    
    // Stop camera after capturing
    stopCamera();
  };
  
  return (
    <Layout>
      <div className="container">
        <h1 className="page-title">Đăng ký Khuôn mặt</h1>
        
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}
        
        <div className="card mb-4">
          <h2 className="card-title">Thông tin người dùng mới</h2>
          
          <form onSubmit={handleSubmit} className="register-face-form">
            <div className="two-column-form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
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
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cccd" className="form-label">
                    ID
                  </label>
                  <input
                    id="cccd"
                    type="text"
                    value={cccd}
                    onChange={(e) => setCccd(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">
                    Ảnh khuôn mặt
                  </label>
                  
                  <div className="upload-methods">
                    <div className="upload-container" onClick={() => fileInputRef.current?.click()}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="file-input-hidden"
                      />
                      <div className="upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <div className="upload-text">Chọn ảnh hoặc kéo thả</div>
                    </div>
                    
                    <div className="webcam-preview">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="webcam-video"
                          ></video>
                          <div className="camera-controls">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="btn btn-primary"
                            >
                              Chụp ảnh
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="btn btn-danger"
                            >
                              Hủy
                            </button>
                          </div>
                        </>
                      ) : photoPreview ? (
                        <div className="photo-preview">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="preview-image"
                          />
                        </div>
                      ) : (
                        <div className="camera-placeholder" onClick={startCamera}>
                          <div className="camera-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                              <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                          </div>
                          <div className="camera-text">Chụp ảnh bằng camera</div>
                        </div>
                      )}
                      
                      {cameraError && (
                        <div className="alert alert-danger">
                          {cameraError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hidden canvas for capturing from video */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            <div className="form-actions">
              <button
                type="submit"
                disabled={isSubmitting || !photo}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                    Đang xử lý...
                  </>
                ) : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="card">
          <h2 className="card-title">Danh sách người dùng đã đăng ký</h2>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p>Chưa có người dùng nào được đăng ký</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ tên</th>
                    <th>Số điện thoại</th>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.phone}</td>
                      <td>{user.cccd}</td>
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

export default RegisterFace; 