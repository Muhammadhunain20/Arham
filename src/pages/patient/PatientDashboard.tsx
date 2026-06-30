import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import axios from 'axios';
import { Calendar, Clock, Star } from 'lucide-react';

interface Appointment {
  _id: string;
  clinicId: {
    _id: string;
    name: string;
    isOpen: boolean;
    currentQueueNumber: number;
    lastCompletedNumber: number;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
    specialist: string;
  };
  requestedTime: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  queueInfo: {
    queueNumber: number;
    status: 'waiting' | 'completed';
  };
  rated?: boolean;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentRating, setCurrentRating] = useState<{ appointmentId: string, rating: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API_URL}/appointments/patient`, {
          withCredentials: true
        });
        setAppointments(res.data.appointments);
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleRateAppointment = async (appointmentId: string) => {
    if (!currentRating || currentRating.appointmentId !== appointmentId) return;

    try {
      await axios.post(
        `${API_URL}/ratings`,
        {
          appointmentId,
          rating: currentRating.rating
        },
        { withCredentials: true }
      );
      
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId ? { ...app, rated: true } : app
        )
      );
      
      setCurrentRating(null);
      setSuccessMessage('Thank you for your rating!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
          <h3 className="mb-4">Welcome, {user?.firstName}!</h3>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Calendar size={40} color="#2b6cb0" />
              </div>
              <h5 className="mb-1">Appointments</h5>
              <p className="display-4 font-weight-bold mb-0">
                {appointments.filter(a => a.status === 'accepted' || a.status === 'pending').length}
              </p>
              <p className="text-muted">upcoming</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Clock size={40} color="#ed8936" />
              </div>
              <h5 className="mb-1">Pending</h5>
              <p className="display-4 font-weight-bold mb-0">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-muted">awaiting approval</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Star size={40} color="#48bb78" />
              </div>
              <h5 className="mb-1">Completed</h5>
              <p className="display-4 font-weight-bold mb-0">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-muted">past appointments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming & Pending Appointments</h5>
            </Card.Header>
            <Card.Body>
              {appointments.filter(a => a.status === 'accepted' || a.status === 'pending').length === 0 ? (
                <p className="text-center text-muted my-4">No upcoming appointments</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Clinic</th>
                      <th>Doctor</th>
                      <th>Requested Time</th>
                      <th>Status</th>
                      <th>Queue Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(a => a.status === 'accepted' || a.status === 'pending')
                      .map((appointment) => (
                        <tr key={appointment._id}>
                          <td>
                            <div>
                              <div>{appointment.clinicId.name}</div>
                              <small className="text-muted">
                                {appointment.clinicId.isOpen ? (
                                  <Badge bg="success" pill>Open</Badge>
                                ) : (
                                  <Badge bg="danger" pill>Closed</Badge>
                                )}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}</div>
                              <small className="text-muted">{appointment.doctorId.specialist}</small>
                            </div>
                          </td>
                          <td>{formatDate(appointment.requestedTime)}</td>
                          <td>
                            {appointment.status === 'pending' ? (
                              <Badge bg="warning">Pending</Badge>
                            ) : (
                              <Badge bg="success">Confirmed</Badge>
                            )}
                          </td>
                          <td>
                            {appointment.status === 'accepted' && appointment.queueInfo ? (
                              <div>
                                <div className="queue-number">#{appointment.queueInfo.queueNumber}</div>
                                <br />
                                <small className="text-muted">
                                  Last Completed: #{appointment.clinicId.lastCompletedNumber || 0}
                                </small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
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

      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Completed Appointments</h5>
            </Card.Header>
            <Card.Body>
              {appointments.filter(a => a.status === 'completed').length === 0 ? (
                <p className="text-center text-muted my-4">No completed appointments</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Clinic</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(a => a.status === 'completed')
                      .map((appointment) => (
                        <tr key={appointment._id}>
                          <td>
                            <div>{appointment.clinicId.name}</div>
                          </td>
                          <td>
                            <div>
                              <div>Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}</div>
                              <small className="text-muted">{appointment.doctorId.specialist}</small>
                            </div>
                          </td>
                          <td>{formatDate(appointment.requestedTime)}</td>
                          <td>
                            {appointment.rated ? (
                              <div className="rating-stars">
                                <span>Thank you for rating!</span>
                              </div>
                            ) : (
                              <div>
                                <div className="rating-stars mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={20}
                                      fill={
                                        currentRating?.appointmentId === appointment._id && 
                                        star <= currentRating.rating
                                          ? '#f6ad55'
                                          : 'none'
                                      }
                                      color="#f6ad55"
                                      onClick={() => setCurrentRating({
                                        appointmentId: appointment._id,
                                        rating: star
                                      })}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  ))}
                                </div>
                                {currentRating?.appointmentId === appointment._id && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleRateAppointment(appointment._id)}
                                  >
                                    Submit Rating
                                  </Button>
                                )}
                              </div>
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

export default PatientDashboard;