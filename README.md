# Doctor Patient Portal

A full-stack web app for connecting patients with doctors and clinics. Doctors can sign up, create and manage a clinic, handle appointment requests, and manage patient queues. Patients can search clinics, request appointments, and track their appointments.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- React Bootstrap
- Express
- MongoDB with Mongoose
- Socket.IO
- JWT authentication with HTTP-only cookies

## Features

- Patient and doctor signup/login
- Role-based protected routes
- Doctor clinic creation and management
- Doctor dashboard with appointment requests and queue overview
- Patient clinic search
- Appointment request, accept, decline, and queue flow
- Clinic open/close status
- User profile management

## Project Structure

```text
.
├── public/              # Static frontend assets
├── server/              # Express API, routes, models, middleware
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
├── src/                 # React frontend
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

The server uses this default database URL:

```text
mongodb://localhost:27017/doctor-patient-portal
```

Make sure MongoDB is running locally, or provide your own connection string with `MONGODB_URI`.

### 3. Run The App

Start frontend and backend together:

```bash
npm run dev:full
```

Or run them separately:

```bash
npm run dev
npm run server
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:5000/api
```

## Environment Variables

Create a `.env` file if you need custom values:

```env
MONGODB_URI=mongodb://localhost:27017/doctor-patient-portal
JWT_SECRET=your_jwt_secret_key
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Available Scripts

```bash
npm run dev       # Start the Vite frontend
npm run server    # Start the Express backend
npm run dev:full  # Start frontend and backend together
npm run build     # Create a production frontend build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Main Routes

Frontend routes:

- `/` - Home page
- `/login` - Login
- `/signup` - Signup
- `/doctor` - Doctor dashboard
- `/doctor/create-clinic` - Doctor clinic setup
- `/doctor/clinic` - Clinic management
- `/doctor/appointments` - Doctor appointments
- `/patient` - Patient dashboard
- `/patient/search` - Search clinics
- `/patient/appointments` - Patient appointments

API route groups:

- `/api/auth`
- `/api/users`
- `/api/clinics`
- `/api/appointments`
- `/api/queue`
- `/api/ratings`

## Notes

- Doctors must create a clinic before using the doctor dashboard.
- Authentication uses cookies, so frontend requests include `withCredentials: true`.
- The backend CORS origin is configured for `http://localhost:5173`.
