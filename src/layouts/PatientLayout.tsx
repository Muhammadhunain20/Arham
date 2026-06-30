import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PatientSidebar from '../components/patient/PatientSidebar';

const PatientLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex">
        <PatientSidebar />
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

export default PatientLayout;