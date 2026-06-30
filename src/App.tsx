import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DoctorLayout from './layouts/DoctorLayout';
import PatientLayout from './layouts/PatientLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CreateClinicPage from './pages/doctor/CreateClinicPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import SearchClinicsPage from './pages/patient/SearchClinicsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AppointmentsPage from './pages/appointment/AppointmentsPage';
import ClinicPage from './pages/doctor/ClinicPage';

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole = null 
}: { 
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'patient' | null;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Doctor routes */}
      <Route path="/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="create-clinic" element={<CreateClinicPage />} />
        <Route path="clinic" element={<ClinicPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Patient routes */}
      <Route path="/patient" element={
        <ProtectedRoute requiredRole="patient">
          <PatientLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PatientDashboard />} />
        <Route path="search" element={<SearchClinicsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 - Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
