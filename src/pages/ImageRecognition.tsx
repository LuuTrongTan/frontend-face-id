import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import Layout from '../components/Layout/Layout';
import FaceRecognitionResult from '../components/FaceScanner/FaceRecognitionResult';
import { recognizeFromImage } from '../api/faceApi';
import '../styles/PageContent.css';
import '../styles/FaceScanner.css';

interface Match {
  name: string;
  confidence: number;
}

const ImageRecognition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
        return;
      }
      
      // Kiểm tra định dạng file
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setError('Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPG hoặc PNG.');
        return;
      }
      
      setSelectedImage(file);
      setError(null);
      setMatches([]);
      
      // Tạo preview ảnh
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Lỗi khi truy cập camera:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Thiết lập kích thước canvas bằng với video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Vẽ frame hiện tại từ video lên canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Chuyển đổi canvas thành blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Tạo file từ blob
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            
            // Tạo preview
            const imageUrl = URL.createObjectURL(blob);
            setImagePreview(imageUrl);
            
            // Dừng camera stream
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
  };
  
  const handleProcessImage = async () => {
    if (!selectedImage) {
      setError('Vui lòng chọn ảnh để nhận diện');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await recognizeFromImage(selectedImage);
      setMatches(result.matches);
      
      if (result.matches.length === 0) {
        setError('Không nhận diện được khuôn mặt nào trong ảnh.');
      }
    } catch (error) {
      console.error('Lỗi khi nhận diện ảnh:', error);
      setError('Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setMatches([]);
    setError(null);
    stopCamera();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Layout>
      <div className="container">
        <h1 className="page-title">Nhận diện qua Hình ảnh</h1>
        
        <div className="two-column-grid">
          <div>
            <div className="card mb-4">
              <h2 className="card-title">Tải lên ảnh</h2>
              
              {!showCamera ? (
                <div className="form-container">
                  <div className="form-group mb-4">
                    <label className="form-label">
                      Chọn ảnh để nhận diện
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="button-group mb-4">
                    <button 
                      onClick={startCamera} 
                      className="btn btn-secondary"
                    >
                      Sử dụng camera
                    </button>
                  </div>
                  
                  {imagePreview && (
                    <div className="form-group mb-4">
                      <label className="form-label">
                        Xem trước
                      </label>
                      <div className="image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="button-group">
                    <button
                      onClick={handleProcessImage}
                      disabled={!selectedImage || isProcessing}
                      className="btn btn-primary"
                    >
                      {isProcessing ? (
                        <span className="loading-text">
                          <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                          Đang xử lý...
                        </span>
                      ) : 'Nhận diện'}
                    </button>
                    
                    <button
                      onClick={handleReset}
                      className="btn btn-secondary"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="camera-container">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                  />
                  
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  <div className="button-group mt-4">
                    <button 
                      onClick={captureImage} 
                      className="btn btn-primary"
                    >
                      Chụp ảnh
                    </button>
                    
                    <button 
                      onClick={stopCamera} 
                      className="btn btn-secondary"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
            </div>
            
            <div className="card">
              <h2 className="card-title">Hướng dẫn</h2>
              <ul className="guide-list">
                <li>Tải lên ảnh chứa khuôn mặt cần nhận diện hoặc sử dụng camera thiết bị</li>
                <li>Ảnh nên rõ nét, đủ ánh sáng và khuôn mặt nhìn thẳng</li>
                <li>Hỗ trợ các định dạng: JPG, PNG</li>
                <li>Kích thước tối đa: 5MB</li>
                <li>Nếu có nhiều khuôn mặt trong ảnh, hệ thống sẽ cố gắng nhận diện tất cả</li>
              </ul>
            </div>
          </div>
          
          <div>
            <div className="card">
              <h2 className="card-title">Kết quả nhận diện</h2>
              <FaceRecognitionResult matches={matches} imageSrc={imagePreview || undefined} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageRecognition; 