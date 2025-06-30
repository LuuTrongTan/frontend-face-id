import { useRef, useEffect, useState } from 'react';
import ReactWebcam from 'react-webcam';

interface WebcamProps {
  onCapture: (imageSrc: string) => void;
  isActive: boolean;
}

const Webcam = ({ onCapture, isActive }: WebcamProps) => {
  const webcamRef = useRef<ReactWebcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Lấy danh sách camera
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Tự động chọn camera đầu tiên
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    
    getDevices();
  }, [selectedDeviceId]);
  
  // Chụp ảnh tự động khi isActive = true
  useEffect(() => {
    let captureInterval: number | null = null;
    
    if (isActive && webcamRef.current) {
      captureInterval = window.setInterval(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          onCapture(imageSrc);
        }
      }, 1000); // Chụp mỗi 1 giây
    }
    
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isActive, onCapture]);
  
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
  };
  
  return (
    <div className="webcam-container">
      <div className="webcam-wrapper">
        <ReactWebcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam"
        />
        {isActive && (
          <div className="recording-indicator" />
        )}
      </div>
      
      {devices.length > 1 && (
        <div className="form-group">
          <label htmlFor="camera-select" className="form-label">
            Chọn camera
          </label>
          <select
            id="camera-select"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="form-select"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Webcam; 