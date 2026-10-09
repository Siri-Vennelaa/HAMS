const express = require('express');
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { isPatient, isDoctor } = require('../middleware/roleMiddleware');

const router = express.Router();

// Patient booking and personal history
router.post('/', protect, isPatient, bookAppointment);
router.get('/my', protect, isPatient, getMyAppointments);

// Doctor specific appointments
router.get('/doctor', protect, isDoctor, getDoctorAppointments);
router.patch('/:id/status', protect, isDoctor, updateAppointmentStatus);

// Cancellation (Patient owner, assigned doctor, or admin)
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
