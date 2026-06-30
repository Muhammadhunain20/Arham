import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0 text-muted">
              &copy; {currentYear} MediConnect. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 text-muted">
              Connecting healthcare professionals and patients
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;