import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Search, Calendar } from 'lucide-react';

const PatientSidebar: React.FC = () => {
  return (
    <div className="bg-light border-end" style={{ width: '250px', minHeight: '100%' }}>
      <div className="p-3">
        <h5 className="mb-4 mt-2 text-center">Patient Portal</h5>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <NavLink 
              to="/patient" 
              end
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <LayoutDashboard size={18} className="me-2" />
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink 
              to="/patient/profile" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <UserCircle size={18} className="me-2" />
              Profile
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink 
              to="/patient/search" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <Search size={18} className="me-2" />
              Find Clinics
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink 
              to="/patient/appointments" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <Calendar size={18} className="me-2" />
              My Appointments
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatientSidebar;