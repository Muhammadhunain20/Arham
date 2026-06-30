import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SPECIALIST_OPTIONS } from '../../config';

const SignupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('patient');
  const [validated, setValidated] = useState(false);
  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Patient form state
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    contactNo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Doctor form state
  const [doctorData, setDoctorData] = useState({
    firstName: '',
    lastName: '',
    contactNo: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialist: ''
  });

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value
    });
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDoctorData({
      ...doctorData,
      [name]: value
    });
  };

  const handlePatientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || patientData.password !== patientData.confirmPassword) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      await signup(patientData, 'patient');
      navigate('/patient');
    } catch (error) {
      // Error is already set in the auth context
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || doctorData.password !== doctorData.confirmPassword) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      await signup(doctorData, 'doctor');
      navigate('/doctor/create-clinic');
    } catch (error) {
      // Error is already set in the auth context
    }
  };

  const passwordsMatch = (role: string) => {
    if (role === 'patient') {
      return patientData.password === patientData.confirmPassword;
    } else {
      return doctorData.password === doctorData.confirmPassword;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Join MediConnect</h2>
                <p className="text-muted">Create your account</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={clearError}>
                  {error}
                </Alert>
              )}

              <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="patient">Patient</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="doctor">Doctor</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="patient">
                    <Form noValidate validated={validated} onSubmit={handlePatientSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="patientFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={patientData.firstName}
                              onChange={handlePatientChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              First name is required.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="patientLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={patientData.lastName}
                              onChange={handlePatientChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              Last name is required.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3" controlId="patientContactNo">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contactNo"
                          value={patientData.contactNo}
                          onChange={handlePatientChange}
                          required
                          pattern="[0-9]{10}"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid 10-digit contact number.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="patientEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={patientData.email}
                          onChange={handlePatientChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid email.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="patientPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={patientData.password}
                              onChange={handlePatientChange}
                              required
                              minLength={6}
                            />
                            <Form.Control.Feedback type="invalid">
                              Password must be at least 6 characters.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="patientConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={patientData.confirmPassword}
                              onChange={handlePatientChange}
                              required
                              isInvalid={validated && !passwordsMatch('patient')}
                            />
                            <Form.Control.Feedback type="invalid">
                              Passwords do not match.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button variant="primary" type="submit" className="w-100 mt-3">
                        Sign Up as Patient
                      </Button>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="doctor">
                    <Form noValidate validated={validated} onSubmit={handleDoctorSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="doctorFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={doctorData.firstName}
                              onChange={handleDoctorChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              First name is required.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="doctorLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={doctorData.lastName}
                              onChange={handleDoctorChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              Last name is required.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3" controlId="doctorContactNo">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contactNo"
                          value={doctorData.contactNo}
                          onChange={handleDoctorChange}
                          required
                          pattern="[0-9]{10}"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid 10-digit contact number.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="doctorEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={doctorData.email}
                          onChange={handleDoctorChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid email.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="doctorSpecialist">
                        <Form.Label>Specialization</Form.Label>
                        <Form.Select
                          name="specialist"
                          value={doctorData.specialist}
                          onChange={handleDoctorChange}
                          required
                        >
                          <option value="">Select Specialization</option>
                          {SPECIALIST_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Please select your specialization.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="doctorPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={doctorData.password}
                              onChange={handleDoctorChange}
                              required
                              minLength={6}
                            />
                            <Form.Control.Feedback type="invalid">
                              Password must be at least 6 characters.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="doctorConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={doctorData.confirmPassword}
                              onChange={handleDoctorChange}
                              required
                              isInvalid={validated && !passwordsMatch('doctor')}
                            />
                            <Form.Control.Feedback type="invalid">
                              Passwords do not match.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button variant="primary" type="submit" className="w-100 mt-3">
                        Sign Up as Doctor
                      </Button>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;