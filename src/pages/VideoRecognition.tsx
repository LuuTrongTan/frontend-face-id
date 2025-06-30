import { useState, useCallback, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Webcam from '../components/FaceScanner/Webcam';
import FaceRecognitionResult from '../components/FaceScanner/FaceRecognitionResult';
import { startVideoRecognition, stopVideoRecognition } from '../api/faceApi';
import '../styles/PageContent.css';
import '../styles/FaceScanner.css';

interface Match {
  name: string;
  confidence: number;
  userId?: number;
}

const VideoRecognition = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Dừng quét khi trang bị unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        handleStopScanning();
      }
    };
  }, [isScanning]);
  
  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc);
    
    // Giả lập kết quả từ API (Trong thực tế sẽ gửi imageSrc lên server để nhận diện)
    // Sau khi API hoàn tất, ta sẽ nhận kết quả và cập nhật matches
    
    // Đây là dữ liệu giả để demo UI
    const mockResult = {
      matches: [
        { name: 'Nguyễn Văn A', confidence: Math.random() * 20 + 80, userId: 1 },
        { name: 'Trần Thị B', confidence: Math.random() * 20 + 60, userId: 2 },
        { name: 'Lê Văn C', confidence: Math.random() * 20 + 40, userId: 3 }
      ]
    };
    
    setMatches(mockResult.matches);
  }, []);
  
  const handleStartScanning = async () => {
    try {
      setError(null);
      await startVideoRecognition();
      setIsScanning(true);
    } catch (err) {
      setError('Không thể bắt đầu nhận diện. Vui lòng thử lại.');
      console.error(err);
    }
  };
  
  const handleStopScanning = async () => {
    try {
      await stopVideoRecognition();
      setIsScanning(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <Layout>
      <div className="container">
        <h1 className="page-title">Nhận diện qua Camera</h1>
        
        <div className="two-column-grid">
          <div>
            <div className="card mb-4">
              <h2 className="card-title">Camera</h2>
              <Webcam onCapture={handleCapture} isActive={isScanning} />
              
              <div className="button-group">
                {!isScanning ? (
                  <button 
                    onClick={handleStartScanning}
                    className="btn btn-primary"
                  >
                    Bắt đầu nhận diện
                  </button>
                ) : (
                  <button 
                    onClick={handleStopScanning}
                    className="btn btn-danger"
                  >
                    Dừng nhận diện
                  </button>
                )}
              </div>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
            </div>
            
            <div className="card">
              <h2 className="card-title">Hướng dẫn</h2>
              <ul className="guide-list">
                <li>Đảm bảo khuôn mặt được đặt ở trung tâm camera</li>
                <li>Giữ khuôn mặt trong phạm vi nhận diện</li>
                <li>Tránh ánh sáng quá mạnh hoặc quá tối</li>
                <li>Kết quả nhận diện sẽ hiển thị ở bên phải</li>
              </ul>
            </div>
          </div>
          
          <div>
            <div className="card">
              <h2 className="card-title">Kết quả nhận diện</h2>
              <FaceRecognitionResult matches={matches} imageSrc={capturedImage || undefined} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoRecognition; 