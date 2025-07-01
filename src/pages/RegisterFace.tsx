import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { registerFace } from '../api/faceApi';
import '../styles/PageContent.css';
import '../styles/RegisterFace.css';

const RegisterFace = () => {
  const [name, setName] = useState('');
  const [cccd, setCccd] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset các trường khi component mount lần đầu
  useEffect(() => {
    setName('');
    setCccd('');
    setPhoto(null);
    setPhotoPreview(null);
    setBase64Image(null);
  }, []);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({
          text: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.',
          type: 'error'
        });
        return;
      }
      
      setPhoto(selectedFile);
      
      // Chuyển đổi ảnh sang base64 và hiển thị preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const base64String = event.target.result as string;
          setPhotoPreview(base64String);
          setBase64Image(base64String);
          
          // Xóa thông báo lỗi nếu có
          if (message && message.type === 'error') {
            setMessage(null);
          }
        }
      };
      
      reader.onerror = () => {
        setMessage({
          text: 'Lỗi khi đọc file ảnh. Vui lòng thử lại.',
          type: 'error'
        });
      };
      
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const resetPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setBase64Image(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo || !base64Image) {
      setMessage({
        text: 'Vui lòng chọn ảnh khuôn mặt',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('cccd', cccd);
      formData.append('photo', photo);
      
      // Gửi ảnh dưới dạng base64, loại bỏ phần prefix
      const base64Data = base64Image.split(',')[1]; 
      formData.append('photo_base64', base64Data);
      
      await registerFace(formData);
      
      setMessage({
        text: 'Đăng ký khuôn mặt thành công!',
        type: 'success'
      });
      
      // Reset form
      setName('');
      setCccd('');
      resetPhoto();
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
  
  return (
    <Layout>
      <div className="container">
        <h1 className="page-title">Đăng ký Khuôn mặt</h1>
        
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}
        
        <div className="card">
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
                  
                  {!photoPreview ? (
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
                  ) : (
                    <div className="avatar-preview-container">
                      <div className="avatar-preview">
                        <img
                          src={photoPreview}
                          alt="Avatar"
                          className="avatar-image"
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-danger avatar-remove-btn"
                        onClick={resetPhoto}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
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
      </div>
    </Layout>
  );
};

export default RegisterFace; 