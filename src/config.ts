// Configuration constants for the application

// API URL - change based on environment
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Socket.io URL - typically same as API URL but without the path
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Specialist options for doctor signup
export const SPECIALIST_OPTIONS = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Neurologist',
  'Obstetrician/Gynecologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Otolaryngologist (ENT)',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Rheumatologist',
  'Urologist',
  'General Physician',
  'Dentist'
];

// Days of the week for clinic availability
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Pagination config
export const ITEMS_PER_PAGE = 10;