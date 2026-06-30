import React from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to appropriate dashboard if no user
  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Container className="py-4">
      {user.role === 'doctor' ? (
        <DoctorAppointments />
      ) : (
        <PatientAppointments />
      )}
    </Container>
  );
};

const DoctorAppointments: React.FC = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Appointments Management</h2>
          <p className="text-muted">Manage your patient appointments</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Today's Appointments</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Status</th>
                    <th>Queue No.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>09:00 AM</td>
                    <td>John Doe</td>
                    <td>
                      <Badge bg="success">In Progress</Badge>
                    </td>
                    <td>1</td>
                    <td>
                      <Badge bg="primary" className="cursor-pointer">
                        Complete
                      </Badge>
                    </td>
                  </tr>
                  {/* Add more appointments here */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const PatientAppointments: React.FC = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h2>My Appointments</h2>
          <p className="text-muted">View and manage your appointments</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming Appointments</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Doctor</th>
                    <th>Clinic</th>
                    <th>Status</th>
                    <th>Queue No.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Today, 09:00 AM</td>
                    <td>Dr. Jane Smith</td>
                    <td>City Health Clinic</td>
                    <td>
                      <Badge bg="warning">Waiting</Badge>
                    </td>
                    <td>3</td>
                  </tr>
                  {/* Add more appointments here */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AppointmentsPage;