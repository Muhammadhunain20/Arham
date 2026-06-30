import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { UserCircle, Calendar, Star, Search, Building, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container className="py-5 fade-in">
      <Row className="mb-5 text-center">
        <Col>
          <h1 className="display-4 fw-bold mb-3">MediConnect</h1>
          <p className="lead mb-4">
            Connecting patients with healthcare professionals for efficient and convenient healthcare management.
          </p>
          {!isAuthenticated ? (
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/login">
                <Button variant="primary" size="lg">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline-primary" size="lg">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <Link to={user?.role === 'doctor' ? "/doctor" : "/patient"}>
              <Button variant="primary" size="lg">Go to Dashboard</Button>
            </Link>
          )}
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Calendar size={50} color="#2b6cb0" />
              </div>
              <Card.Title>Easy Appointment Booking</Card.Title>
              <Card.Text>
                Schedule appointments with doctors of your choice at your convenience.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Stethoscope size={50} color="#2b6cb0" />
              </div>
              <Card.Title>Expert Healthcare</Card.Title>
              <Card.Text>
                Connect with specialists across various medical fields.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Star size={50} color="#2b6cb0" />
              </div>
              <Card.Title>Trusted Reviews</Card.Title>
              <Card.Text>
                Read and share experiences to make informed healthcare decisions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <h2 className="mb-4">For Patients</h2>
          <ul className="list-unstyled">
            <li className="mb-3 d-flex align-items-center">
              <Search className="me-2" size={24} color="#48bb78" />
              <span>Find clinics and doctors near you</span>
            </li>
            <li className="mb-3 d-flex align-items-center">
              <Calendar className="me-2" size={24} color="#48bb78" />
              <span>Book appointments without phone calls</span>
            </li>
            <li className="mb-3 d-flex align-items-center">
              <UserCircle className="me-2" size={24} color="#48bb78" />
              <span>View your position in real-time queues</span>
            </li>
          </ul>
        </Col>
        <Col md={6} className="mb-4">
          <h2 className="mb-4">For Doctors</h2>
          <ul className="list-unstyled">
            <li className="mb-3 d-flex align-items-center">
              <Building className="me-2" size={24} color="#4299e1" />
              <span>Manage your clinic information</span>
            </li>
            <li className="mb-3 d-flex align-items-center">
              <Calendar className="me-2" size={24} color="#4299e1" />
              <span>Handle appointment requests efficiently</span>
            </li>
            <li className="mb-3 d-flex align-items-center">
              <UserCircle className="me-2" size={24} color="#4299e1" />
              <span>Track patient queue and appointments</span>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;