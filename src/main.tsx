import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Import CSS
import './index.css'
import './styles/common.css'
import './App.css'
import './styles/Layout.css'
import './styles/Login.css'
import './styles/Dashboard.css'
import './styles/DeviceStatus.css'
import './styles/LogManagement.css'
import './styles/RegisterFace.css'
import './styles/FaceScanner.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
