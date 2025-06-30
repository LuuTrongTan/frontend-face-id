import API from './axiosConfig';

export interface FaceUser {
  id: number;
  name: string;
  phone: string;
  cccd: string;
  face_path: string;
  created_at: string;
}

export interface FaceRegistrationData {
  name: string;
  phone: string;
  cccd: string;
  photo: File;
}

export interface RecognitionResult {
  id: number;
  user_id: number;
  user_name: string;
  confidence: number;
  timestamp: string;
  image_path: string;
  method: 'image' | 'video';
}

export const registerFace = (data: FormData) => {
  return API.post<{ message: string; id: number; name: string; phone: string; cccd: string; face_path: string }>('/register_face', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => response.data);
};

export const getAllFaceUsers = () => {
  return API.get<FaceUser[]>('/users')
    .then(response => response.data);
};

export const deleteFaceUser = (userId: number) => {
  return API.delete(`/user/${userId}`)
    .then(response => response.data);
};

export const recognizeFromImage = (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return API.post<{ matches: { name: string; confidence: number }[] }>('/recognize_image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => response.data);
};

export const startVideoRecognition = () => {
  return API.post('/start_video_recognition')
    .then(response => response.data);
};

export const stopVideoRecognition = () => {
  return API.post('/stop_video_recognition')
    .then(response => response.data);
};

export const getRecognitionResults = () => {
  return API.get<RecognitionResult[]>('/recognition_results')
    .then(response => response.data);
}; 