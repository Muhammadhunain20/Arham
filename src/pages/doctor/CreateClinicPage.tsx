import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, DAYS_OF_WEEK } from '../../config';
import { useAuth } from '../../context/AuthContext';

const CreateClinicPage: React.FC = () => {
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    fees: '',
    openTime: '09:00',
    closeTime: '17:00',
    days: [] as string[]
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClinicData({
      ...clinicData,
      [name]: value
    });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setClinicData({
        ...clinicData,
        days: [...clinicData.days, value]
      });
    } else {
      setClinicData({
        ...clinicData,
        days: clinicData.days.filter(day => day !== value)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || clinicData.days.length === 0) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      await axios.post(`${API_URL}/clinics`, {
        ...clinicData,
        doctorId: user?._id,
        fees: Number(clinicData.fees),
        isOpen: true
      }, {
        withCredentials: true
      });
      
      await refreshUser();
      navigate('/doctor', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create clinic. Please try again.');
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Create Your Clinic</h2>
                <p className="text-muted">Setup your clinic information to start accepting patients</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="clinicName">
                  <Form.Label>Clinic Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={clinicData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Clinic name is required.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="clinicAddress">
                  <Form.Label>Clinic Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={clinicData.address}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Clinic address is required.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="clinicFees">
                  <Form.Label>Consultation Fees (in Rs.)</Form.Label>
                  <Form.Control
                    type="number"
                    name="fees"
                    value={clinicData.fees}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter valid consultation fees.
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="openTime">
                      <Form.Label>Opening Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="openTime"
                        value={clinicData.openTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="closeTime">
                      <Form.Label>Closing Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="closeTime"
                        value={clinicData.closeTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Working Days</Form.Label>
                  <div>
                    {DAYS_OF_WEEK.map((day) => (
                      <Form.Check
                        key={day}
                        inline
                        type="checkbox"
                        id={`day-${day}`}
                        label={day}
                        value={day}
                        onChange={handleDayChange}
                        isInvalid={validated && clinicData.days.length === 0}
                        className="me-3 mb-2"
                      />
                    ))}
                    {validated && clinicData.days.length === 0 && (
                      <div className="text-danger small mt-1">
                        Please select at least one working day.
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Create Clinic
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateClinicPage;
