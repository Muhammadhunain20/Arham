import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  name: {
    type: String,
    required: [true, 'Clinic name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Clinic address is required'],
    trim: true
  },
  fees: {
    type: Number,
    required: [true, 'Consultation fees are required'],
    min: [0, 'Fees cannot be negative']
  },
  openTime: {
    type: String,
    required: [true, 'Opening time is required']
  },
  closeTime: {
    type: String,
    required: [true, 'Closing time is required']
  },
  days: {
    type: [String],
    required: [true, 'Working days are required'],
    validate: {
      validator: function(value) {
        return value.length > 0;
      },
      message: 'At least one working day must be selected'
    }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for average rating (populated from Rating model)
clinicSchema.virtual('averageRating').get(function() {
  return this._averageRating || 0;
});

clinicSchema.virtual('totalRatings').get(function() {
  return this._totalRatings || 0;
});

// Virtual field for current queue length (populated from Queue model)
clinicSchema.virtual('queueLength').get(function() {
  return this._queueLength || 0;
});

clinicSchema.set('toJSON', { virtuals: true });
clinicSchema.set('toObject', { virtuals: true });

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;