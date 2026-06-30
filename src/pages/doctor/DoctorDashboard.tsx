import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import axios from 'axios';
import { Users, UserCheck, Clock, User } from 'lucide-react';

interface Clinic {
  _id: string;
  name: string;
  isOpen: boolean;
}

interface AppointmentRequest {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  requestedTime: string;
  symptoms: string;
  status: 'pending';
}

interface QueuePatient {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  queueNumber: number;
  status: 'waiting' | 'completed';
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [queuePatients, setQueuePatients] = useState<QueuePatient[]>([]);
  const [lastCompletedNumber, setLastCompletedNumber] = useState<number>(0);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const res = await axios.get(`${API_URL}/clinics/doctor`, {
          withCredentials: true
        });
        setClinic(res.data.clinic);
      } catch (err) {
        setError('Failed to fetch clinic information');
      }
    };

    if (user) {
      fetchClinicData();
    }
  }, [user]);

  // Fetch appointment requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/appointments/requests`, {
          withCredentials: true
        });
        setAppointmentRequests(res.data.requests);
      } catch (err) {
        setError('Failed to fetch appointment requests');
      }
    };

    if (clinic) {
      fetchRequests();
    }
  }, [clinic]);

  // Fetch queue patients
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`${API_URL}/queue`, {
          withCredentials: true
        });
        setQueuePatients(res.data.queue);
        setLastCompletedNumber(res.data.lastCompletedNumber);
      } catch (err) {
        setError('Failed to fetch patient queue');
      }
    };

    if (clinic) {
      fetchQueue();
    }
  }, [clinic]);

  const toggleClinicStatus = async () => {
    if (!clinic) return;
    
    try {
      setIsStatusUpdating(true);
      const res = await axios.patch(
        `${API_URL}/clinics/${clinic._id}/toggle-status`,
        {},
        { withCredentials: true }
      );
      
      setClinic({
        ...clinic,
        isOpen: res.data.clinic.isOpen
      });
      
      // If clinic is being closed, refresh the queue
      if (!res.data.clinic.isOpen) {
        setQueuePatients([]);
      }
      
      setSuccessMessage(`Clinic is now ${res.data.clinic.isOpen ? 'open' : 'closed'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update clinic status');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await axios.post(
        `${API_URL}/appointments/accept/${requestId}`,
        {},
        { withCredentials: true }
      );
      
      // Remove from requests and refresh queue
      setAppointmentRequests(prev => prev.filter(req => req._id !== requestId));
      
      const res = await axios.get(`${API_URL}/queue`, {
        withCredentials: true
      });
      setQueuePatients(res.data.queue);
      setLastCompletedNumber(res.data.lastCompletedNumber);
      
      setSuccessMessage('Appointment request accepted');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to accept appointment request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await axios.post(
        `${API_URL}/appointments/decline/${requestId}`,
        {},
        { withCredentials: true }
      );
      
      // Remove from requests
      setAppointmentRequests(prev => prev.filter(req => req._id !== requestId));
      
      setSuccessMessage('Appointment request declined');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to decline appointment request');
    }
  };

  const handleCompleteAppointment = async (queueId: string) => {
    try {
      await axios.post(
        `${API_URL}/queue/complete/${queueId}`,
        {},
        { withCredentials: true }
      );
      
      // Update the queue status locally and refresh queue data
      const res = await axios.get(`${API_URL}/queue`, {
        withCredentials: true
      });
      setQueuePatients(res.data.queue);
      setLastCompletedNumber(res.data.lastCompletedNumber);
      
      setSuccessMessage('Appointment marked as completed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to complete appointment');
    }
  };

  const handleResetQueue = async () => {
    try {
      await axios.post(
        `${API_URL}/queue/reset`,
        {},
        { withCredentials: true }
      );
      
      // Clear the queue locally
      setQueuePatients([]);
      setLastCompletedNumber(0);
      
      setSuccessMessage('Queue has been reset');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to reset queue');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!clinic) {
    return (
      <Container>
        <Alert variant="info">
          Loading clinic information...
        </Alert>
      </Container>
    );
  }

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
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{clinic.name}</h4>
                <div className="mt-2">
                  <Badge bg={clinic.isOpen ? 'success' : 'danger'} className="me-2">
                    <span className="d-flex align-items-center">
                      <div className={`status-indicator ${clinic.isOpen ? 'status-open' : 'status-closed'}`} />
                      {clinic.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </Badge>
                </div>
              </div>
              <div>
                <Button
                  variant="warning"
                  onClick={handleResetQueue}
                  className="me-2"
                >
                  Reset Queue
                </Button>
                <Button
                  variant={clinic.isOpen ? 'outline-danger' : 'outline-success'}
                  onClick={toggleClinicStatus}
                  disabled={isStatusUpdating}
                >
                  {isStatusUpdating ? 'Updating...' : (clinic.isOpen ? 'Close Clinic' : 'Open Clinic')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Users size={40} color="#2b6cb0" />
              </div>
              <h5 className="mb-1">Appointment Requests</h5>
              <p className="display-4 font-weight-bold mb-0">{appointmentRequests.length}</p>
              <p className="text-muted">pending approval</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <UserCheck size={40} color="#48bb78" />
              </div>
              <h5 className="mb-1">Current Queue</h5>
              <p className="display-4 font-weight-bold mb-0">
                {queuePatients.filter(p => p.status === 'waiting').length}
              </p>
              <p className="text-muted">waiting patients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Clock size={40} color="#ed8936" />
              </div>
              <h5 className="mb-1">Last Completed</h5>
              <p className="display-4 font-weight-bold mb-0">
                #{lastCompletedNumber}
              </p>
              <p className="text-muted">queue number</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Appointment Requests</h5>
            </Card.Header>
            <Card.Body>
              {appointmentRequests.length === 0 ? (
                <p className="text-center text-muted my-4">No pending appointment requests</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Requested Time</th>
                      <th>Symptoms</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentRequests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <User size={28} color="#4a5568" />
                            </div>
                            <div>
                              <div>{request.patientId.firstName} {request.patientId.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(request.requestedTime)}</td>
                        <td>{request.symptoms}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleAcceptRequest(request._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeclineRequest(request._id)}
                          >
                            Decline
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Patient Queue</h5>
            </Card.Header>
            <Card.Body>
              {queuePatients.length === 0 ? (
                <p className="text-center text-muted my-4">No patients in queue</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Queue No.</th>
                      <th>Patient</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuePatients.map((patient) => (
                      <tr key={patient._id}>
                        <td className="queue-number">{patient.queueNumber}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <User size={28} color="#4a5568" />
                            </div>
                            <div>
                              <div>{patient.patientId.firstName} {patient.patientId.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={patient.status === 'waiting' ? 'warning' : 'success'}>
                            {patient.status === 'waiting' ? 'Waiting' : 'Completed'}
                          </Badge>
                        </td>
                        <td>
                          {patient.status === 'waiting' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCompleteAppointment(patient._id)}
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;