import express from 'express';
import Appointment from '../models/Appointment.js';
import Queue from '../models/Queue.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create appointment request
// @access  Private (Patients only)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { clinicId, doctorId, requestedTime, symptoms } = req.body;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      clinicId,
      doctorId,
      requestedTime,
      symptoms,
      status: 'pending'
    });

    // Emit socket event for real-time updates
    io.to(`clinic:${clinicId}`).emit('newAppointmentRequest', {
      appointmentId: appointment._id
    });

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment request'
    });
  }
});

// @route   GET /api/appointments/requests
// @desc    Get pending appointment requests for doctor
// @access  Private (Doctors only)
router.get('/requests', protect, authorize('doctor'), async (req, res) => {
  try {
    const requests = await Appointment.find({
      doctorId: req.user._id,
      status: 'pending'
    }).populate('patientId', 'firstName lastName');

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment requests'
    });
  }
});

// @route   GET /api/appointments/patient
// @desc    Get patient's appointments
// @access  Private (Patients only)
router.get('/patient', protect, authorize('patient'), async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id
    })
    .populate('clinicId', 'name isOpen')
    .populate('doctorId', 'firstName lastName specialist')
    .populate({
      path: 'queueInfo',
      populate: {
        path: 'clinicId',
        select: 'currentQueueNumber'
      }
    });

    // Get the last completed queue number for each clinic
    const appointmentsWithQueue = await Promise.all(
      appointments.map(async (appointment) => {
        const lastCompleted = await Queue.findOne({
          clinicId: appointment.clinicId._id,
          status: 'completed'
        }).sort('-queueNumber');

        const appointmentObj = appointment.toObject();
        return {
          ...appointmentObj,
          clinicId: {
            ...appointmentObj.clinicId,
            lastCompletedNumber: lastCompleted ? lastCompleted.queueNumber : 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      appointments: appointmentsWithQueue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
});

// @route   POST /api/appointments/accept/:id
// @desc    Accept appointment request and add to queue
// @access  Private (Doctors only)
router.post('/accept/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      status: 'pending'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    // Get current queue number
    const lastQueue = await Queue.findOne({
      clinicId: appointment.clinicId
    }).sort('-queueNumber');

    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    // Create queue entry
    const queue = await Queue.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      clinicId: appointment.clinicId,
      queueNumber,
      status: 'waiting'
    });

    // Update appointment status
    appointment.status = 'accepted';
    await appointment.save();

    // Emit socket events
    io.to(`clinic:${appointment.clinicId}`).emit('appointmentAccepted', {
      appointmentId: appointment._id,
      queueNumber
    });

    res.status(200).json({
      success: true,
      appointment,
      queue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting appointment'
    });
  }
});

// @route   POST /api/appointments/decline/:id
// @desc    Decline appointment request
// @access  Private (Doctors only)
router.post('/decline/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      status: 'pending'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    appointment.status = 'declined';
    await appointment.save();

    // Emit socket event
    io.to(`clinic:${appointment.clinicId}`).emit('appointmentDeclined', {
      appointmentId: appointment._id
    });

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error declining appointment'
    });
  }
});

export default router;