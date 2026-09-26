import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SecurityDashboard from './pages/SecurityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './layouts/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/security" replace />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
