import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, DAYS_OF_WEEK } from '../../config';
import { useAuth } from '../../context/AuthContext';

interface ClinicData {
  _id: string;
  name: string;
  address: string;
  fees: number;
  openTime: string;
  closeTime: string;
  days: string[];
  isOpen: boolean;
  currentQueueNumber: number;
}

const ClinicPage: React.FC = () => {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const { user } = useAuth();
  const navigate= useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    fees: '',
    openTime: '09:00',
    closeTime: '17:00',
    days: [] as string[]
  });

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const response = await axios.get(`${API_URL}/clinics/doctor`, {
          withCredentials: true
        });
        
        if (response.data.clinic) {
          setClinic(response.data.clinic);
          setFormData({
            name: response.data.clinic.name,
            address: response.data.clinic.address,
            fees: response.data.clinic.fees.toString(),
            openTime: response.data.clinic.openTime,
            closeTime: response.data.clinic.closeTime,
            days: response.data.clinic.days
          });
        }
      } catch (err) {
        setError('Failed to fetch clinic information');
      }
    };

    if (user?.role === 'doctor') {
      fetchClinic();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        days: [...formData.days, value]
      });
    } else {
      setFormData({
        ...formData,
        days: formData.days.filter(day => day !== value)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || formData.days.length === 0) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      if (clinic) {
        // Update existing clinic
        const response = await axios.put(
          `${API_URL}/clinics/${clinic._id}`,
          {
            ...formData,
            fees: Number(formData.fees)
          },
          { withCredentials: true }
        );
        setClinic(response.data.clinic);
      }

      setIsEditing(false);
      setSuccessMessage('Clinic information updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update clinic information');
    }
  };

  const handleCloseClinic = async () => {
    if (!clinic) return;

    try {
      const response = await axios.patch(
        `${API_URL}/clinics/${clinic._id}/toggle-status`,
        {},
        { withCredentials: true }
      );
      setClinic(response.data.clinic);
      setShowCloseConfirmation(false);
      setSuccessMessage('Clinic has been closed and queue has been reset');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close clinic');
    }
  };

  const toggleClinicStatus = async () => {
    if (!clinic) return;

    if (clinic.isOpen) {
      setShowCloseConfirmation(true);
    } else {
      try {
        const response = await axios.patch(
          `${API_URL}/clinics/${clinic._id}/toggle-status`,
          {},
          { withCredentials: true }
        );
        setClinic(response.data.clinic);
        setSuccessMessage('Clinic is now open');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update clinic status');
      }
    }
  };

  if (!clinic) {
    return (
      <Container className="py-4">
        <Alert variant="info">Loading clinic information...</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3>Clinic Management</h3>
                  <p className="text-muted mb-0">Manage your clinic information</p>
                </div>
                <div>
                  <Button
                    variant={clinic.isOpen ? 'success' : 'danger'}
                    onClick={toggleClinicStatus}
                    className="me-2"
                  >
                    {clinic.isOpen ? 'Open' : 'Closed'}
                  </Button>
                  {!isEditing && (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Edit Clinic
                    </Button>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
                  {successMessage}
                </Alert>
              )}

              {isEditing ? (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="clinicName">
                    <Form.Label>Clinic Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
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
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Clinic address is required.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="clinicFees">
                    <Form.Label>Consultation Fees (in ₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="fees"
                      value={formData.fees}
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
                          value={formData.openTime}
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
                          value={formData.closeTime}
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
                          checked={formData.days.includes(day)}
                          onChange={handleDayChange}
                          isInvalid={validated && formData.days.length === 0}
                          className="me-3 mb-2"
                        />
                      ))}
                      {validated && formData.days.length === 0 && (
                        <div className="text-danger small mt-1">
                          Please select at least one working day.
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h5>Clinic Name</h5>
                      <p>{clinic.name}</p>
                    </Col>
                    <Col md={6}>
                      <h5>Status</h5>
                      <p>
                        <span className={`status-indicator ${clinic.isOpen ? 'status-open' : 'status-closed'}`} />
                        {clinic.isOpen ? 'Open' : 'Closed'}
                      </p>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={12}>
                      <h5>Address</h5>
                      <p>{clinic.address}</p>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <h5>Consultation Fees</h5>
                      <p>₹{clinic.fees}</p>
                    </Col>
                    <Col md={6}>
                      <h5>Working Hours</h5>
                      <p>{clinic.openTime} - {clinic.closeTime}</p>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <h5>Working Days</h5>
                      <p>{clinic.days.join(', ')}</p>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCloseConfirmation} onHide={() => setShowCloseConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Close Clinic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to close the clinic? This will:</p>
          <ul>
            <li>Mark all current appointments as completed</li>
            <li>Reset the queue</li>
            <li>Stop accepting new appointments</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleCloseClinic}>
            Close Clinic
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClinicPage;