import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { ActivitySquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm py-2">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <ActivitySquare size={24} color="#2b6cb0" className="me-2" />
          <span className="fw-bold">MediConnect</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to={user?.role === 'doctor' ? '/doctor' : '/patient'}
                  className="me-2"
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to={user?.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}
                  className="me-2"
                >
                  Profile
                </Nav.Link>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;