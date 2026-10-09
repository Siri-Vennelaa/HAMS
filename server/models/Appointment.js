const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 10:00 AM)'],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide the reason for your visit'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking: A doctor cannot have more than one active appointment
// for the exact same date and time slot (ignores cancelled or rejected appointments)
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['cancelled', 'rejected'] },
    },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
