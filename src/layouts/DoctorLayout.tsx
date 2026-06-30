import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DoctorSidebar from '../components/doctor/DoctorSidebar';

const DoctorLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep doctors in the correct onboarding/dashboard route based on clinic status.
  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      return;
    }

    const isCreateClinicPage = location.pathname === '/doctor/create-clinic';

    if (!user.hasClinic && !isCreateClinicPage) {
      navigate('/doctor/create-clinic', { replace: true });
    }

    if (user.hasClinic && isCreateClinicPage) {
      navigate('/doctor', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex">
        <DoctorSidebar />
        <div className="flex-grow-1 p-0">
          <Container fluid className="py-4">
            <Outlet />
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorLayout;
