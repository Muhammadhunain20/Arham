import express from 'express';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js';
import Queue from '../models/Queue.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/clinics
// @desc    Create a new clinic
// @access  Private (Doctors only)
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { name, address, fees, openTime, closeTime, days } = req.body;

    const clinic = await Clinic.create({
      doctorId: req.user._id,
      name,
      address,
      fees,
      openTime,
      closeTime,
      days,
      isOpen: true
    });

    // Update doctor's hasClinic status
    await User.findByIdAndUpdate(req.user._id, { hasClinic: true });

    res.status(201).json({
      success: true,
      clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating clinic'
    });
  }
});

// @route   GET /api/clinics
// @desc    Get all clinics (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find()
      .populate('doctorId', 'firstName lastName specialist')
      .lean();

    // Add virtual fields
    const clinicsWithStats = await Promise.all(
      clinics.map(async (clinic) => {
        const ratings = await Rating.find({ clinicId: clinic._id });
        const queue = await Queue.find({ 
          clinicId: clinic._id,
          status: 'waiting'
        });

        return {
          ...clinic,
          averageRating: ratings.reduce((acc, curr) => acc + curr.rating, 0) / (ratings.length || 1),
          totalRatings: ratings.length,
          queueLength: queue.length
        };
      })
    );

    res.status(200).json({
      success: true,
      clinics: clinicsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clinics'
    });
  }
});

// @route   GET /api/clinics/doctor
// @desc    Get doctor's clinic
// @access  Private (Doctors only)
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ doctorId: req.user._id });
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.status(200).json({
      success: true,
      clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clinic'
    });
  }
});

// @route   PUT /api/clinics/:id
// @desc    Update clinic
// @access  Private (Doctors only)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      clinic: updatedClinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating clinic'
    });
  }
});

// @route   PATCH /api/clinics/:id/toggle-status
// @desc    Toggle clinic open/close status
// @access  Private (Doctors only)
router.patch('/:id/toggle-status', protect, authorize('doctor'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    clinic.isOpen = !clinic.isOpen;
    await clinic.save();

    // If closing, clear the queue
    if (!clinic.isOpen) {
      await Queue.updateMany(
        { clinicId: clinic._id, status: 'waiting' },
        { status: 'completed' }
      );
    }

    // Emit socket event for real-time updates
    io.to(`clinic:${clinic._id}`).emit('clinicStatusChanged', {
      clinicId: clinic._id,
      isOpen: clinic.isOpen
    });

    res.status(200).json({
      success: true,
      clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling clinic status'
    });
  }
});

export default router;