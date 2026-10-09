const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: [true, 'Slot time is required (e.g. 09:30 AM)'],
      trim: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD format)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    slots: [slotSchema],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate availability documents for the same doctor and date
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
