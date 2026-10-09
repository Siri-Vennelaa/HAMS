const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify doctor specialization'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify doctor department'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Please provide doctor qualification (e.g. MBBS, MD)'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    },
  },
  {
    timestamps: true,
  }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;
