import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Building, Calendar } from 'lucide-react';

const DoctorSidebar: React.FC = () => {
  return (
    <div className="bg-light border-end" style={{ width: '250px', minHeight: '100%' }}>
      <div className="p-3">
        <h5 className="mb-4 mt-2 text-center">Doctor Portal</h5>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <NavLink 
              to="/doctor" 
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
              to="/doctor/profile" 
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
              to="/doctor/clinic" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <Building size={18} className="me-2" />
              Clinic
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink 
              to="/doctor/appointments" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-dark'}`
              }
            >
              <Calendar size={18} className="me-2" />
              Appointments
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorSidebar;