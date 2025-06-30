import type { FC } from 'react';
import Layout from '../components/Layout/Layout';
import '../styles/DeviceStatus.css';

const DeviceStatus: FC = () => {
  return (
    <Layout>
      <div className="device-status-container">
        <h1>Device Status</h1>
        <div className="device-list">
          <p>Device status monitoring will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default DeviceStatus; 