import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { API_URL, SPECIALIST_OPTIONS } from '../../config';
import axios from 'axios';
import { Search, MapPin, Star, Clock, DollarSign } from 'lucide-react';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
    specialist: string;
  };
  fees: number;
  openTime: string;
  closeTime: string;
  days: string[];
  isOpen: boolean;
  averageRating: number;
  totalRatings: number;
  queueLength: number;
  currentQueueNumber: number;
  lastCompletedNumber: number;
}

const SearchClinicsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [allClinics, setAllClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');

  // Fetch clinics
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/clinics`, {
          withCredentials: true
        });
        setAllClinics(res.data.clinics);
        setClinics(res.data.clinics);
      } catch (err) {
        setError('Failed to fetch clinics');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Filter clinics based on search and filters
  useEffect(() => {
    let filteredClinics = [...allClinics];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredClinics = filteredClinics.filter(
        clinic => 
          clinic.name.toLowerCase().includes(query) ||
          clinic.address.toLowerCase().includes(query) ||
          clinic.doctorId.firstName.toLowerCase().includes(query) ||
          clinic.doctorId.lastName.toLowerCase().includes(query)
      );
    }
    
    // Apply specialist filter
    if (specialistFilter) {
      filteredClinics = filteredClinics.filter(
        clinic => clinic.doctorId.specialist === specialistFilter
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredClinics = filteredClinics.filter(
        clinic => clinic.isOpen === (statusFilter === 'open')
      );
    }
    
    setClinics(filteredClinics);
  }, [searchQuery, specialistFilter, statusFilter, allClinics]);

  const handleAppointmentRequest = async (clinic: Clinic) => {
    if (!clinic.isOpen) {
      setError('This clinic is currently closed. Please try again later or select an open clinic.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/appointments`,
        {
          clinicId: clinic._id,
          doctorId: clinic.doctorId._id,
          requestedTime: new Date().toISOString(),
          symptoms: symptoms || 'General consultation'
        },
        { withCredentials: true }
      );
      
      setSuccessMessage('Appointment request submitted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSymptoms('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request appointment');
    }
  };

  return (
    <Container className="py-4">
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
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Find Clinics</h4>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by clinic name, doctor name, or address"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        value={specialistFilter}
                        onChange={(e) => setSpecialistFilter(e.target.value)}
                      >
                        <option value="">All Specialists</option>
                        {SPECIALIST_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Clinics</option>
                        <option value="open">Open Now</option>
                        <option value="closed">Closed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {loading ? (
          <Col className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading clinics...</p>
          </Col>
        ) : clinics.length === 0 ? (
          <Col className="text-center py-5">
            <p className="text-muted">No clinics found matching your search criteria</p>
          </Col>
        ) : (
          clinics.map((clinic) => (
            <Col key={clinic._id} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm h-100 card-hover">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="mb-0">{clinic.name}</h5>
                    <Badge bg={clinic.isOpen ? 'success' : 'danger'} pill>
                      {clinic.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <MapPin size={16} className="me-2" />
                      <small>{clinic.address}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted mb-2">
                      <Clock size={16} className="me-2" />
                      <small>{clinic.openTime} - {clinic.closeTime}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted mb-2">
                      <DollarSign size={16} className="me-2" />
                      <small>Rs.{clinic.fees} consultation fee</small>
                    </div>
                    <div className="text-muted mb-2">
                      <small><strong>Working Days:</strong> {clinic.days.join(', ')}</small>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1">Dr. {clinic.doctorId.firstName} {clinic.doctorId.lastName}</p>
                    <p className="mb-0 text-muted">{clinic.doctorId.specialist}</p>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex align-items-center rating-stars">
                      <Star size={16} fill="#f6ad55" />
                      <span className="ms-1">
                        {clinic.averageRating.toFixed(1)} ({clinic.totalRatings})
                      </span>
                    </div>
                    <div>
                      <small className="text-muted">Queue: {clinic.queueLength}</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      {/* <small className="text-muted">Current: #{clinic.currentQueueNumber || 0}</small> */}
                      <small className="text-muted">Last Completed: #{clinic.lastCompletedNumber || 0}</small>
                    </div>
                  </div>

                  {clinic.isOpen && (
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter your symptoms or reason for visit"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                    </Form.Group>
                  )}
                  
                  <Button
                    variant="primary"
                    className="w-100"
                    disabled={!clinic.isOpen}
                    onClick={() => handleAppointmentRequest(clinic)}
                  >
                    Request Appointment
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default SearchClinicsPage;