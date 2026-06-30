import express from 'express';
import Rating from '../models/Rating.js';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ratings
// @desc    Create rating for completed appointment
// @access  Private (Patients only)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { appointmentId, rating, review } = req.body;

    // Check if appointment exists and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user._id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not completed'
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ appointmentId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already rated'
      });
    }

    const newRating = await Rating.create({
      appointmentId,
      patientId: req.user._id,
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      rating,
      review
    });

    // Emit socket event
    io.to(`clinic:${appointment.clinicId}`).emit('newRating', {
      ratingId: newRating._id
    });

    res.status(201).json({
      success: true,
      rating: newRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating rating'
    });
  }
});

// @route   GET /api/ratings/clinic/:clinicId
// @desc    Get clinic ratings
// @access  Public
router.get('/clinic/:clinicId', async (req, res) => {
  try {
    const ratings = await Rating.find({
      clinicId: req.params.clinicId
    })
    .populate('patientId', 'firstName lastName')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings'
    });
  }
});

export default router;