import express from 'express';
import Queue from '../models/Queue.js';
import Appointment from '../models/Appointment.js';
import Clinic from '../models/Clinic.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/queue
// @desc    Get clinic's queue
// @access  Private (Doctors only)
router.get('/', protect, authorize('doctor'), async (req, res) => {
  try {
    // First find the doctor's clinic
    const clinic = await Clinic.findOne({ doctorId: req.user._id });
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    const queue = await Queue.find({
      clinicId: clinic._id,
      status: 'waiting'
    })
    .populate('patientId', 'firstName lastName')
    .sort('queueNumber');

    // Get the last completed queue number
    const lastCompleted = await Queue.findOne({
      clinicId: clinic._id,
      status: 'completed'
    }).sort('-queueNumber');

    res.status(200).json({
      success: true,
      queue,
      lastCompletedNumber: lastCompleted ? lastCompleted.queueNumber : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queue'
    });
  }
});

// @route   POST /api/queue/complete/:id
// @desc    Mark queue entry as completed
// @access  Private (Doctors only)
router.post('/complete/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const queueEntry = await Queue.findOne({
      _id: req.params.id,
      status: 'waiting'
    });

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    // Update queue status
    queueEntry.status = 'completed';
    await queueEntry.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(queueEntry.appointmentId, {
      status: 'completed'
    });

    // Emit socket event with updated queue information
    io.to(`clinic:${queueEntry.clinicId}`).emit('queueUpdated', {
      queueEntryId: queueEntry._id,
      status: 'completed',
      lastCompletedNumber: queueEntry.queueNumber
    });

    res.status(200).json({
      success: true,
      queue: queueEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing queue entry'
    });
  }
});

// @route   POST /api/queue/reset
// @desc    Reset clinic's queue
// @access  Private (Doctors only)
router.post('/reset', protect, authorize('doctor'), async (req, res) => {
  try {
    // First find the doctor's clinic
    const clinic = await Clinic.findOne({ doctorId: req.user._id });
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Get all waiting queue entries
    const queueEntries = await Queue.find({
      clinicId: clinic._id,
      status: 'waiting'
    });

    // Update all appointments to completed
    for (const entry of queueEntries) {
      await Appointment.findByIdAndUpdate(entry.appointmentId, {
        status: 'completed'
      });
    }

    // Mark all waiting queue entries as completed
    await Queue.updateMany(
      {
        clinicId: clinic._id,
        status: 'waiting'
      },
      { status: 'completed' }
    );

    // Emit socket event for queue reset
    io.to(`clinic:${clinic._id}`).emit('queueReset', {
      lastCompletedNumber: queueEntries.length > 0 ? 
        Math.max(...queueEntries.map(entry => entry.queueNumber)) : 0
    });

    res.status(200).json({
      success: true,
      message: 'Queue has been reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting queue'
    });
  }
});

export default router;