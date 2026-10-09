const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getMyDoctorProfile,
  updateDoctorProfile,
  addAvailability,
  getMyAvailability,
  deleteSlot,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { isDoctor } = require('../middleware/roleMiddleware');

const router = express.Router();

// Specific and static endpoints MUST come before parameterized /:id routes

// 1. Doctor Protected Profile & Availability Routes
router.get('/profile/me', protect, isDoctor, getMyDoctorProfile);
router.put('/profile', protect, isDoctor, updateDoctorProfile);
router.post('/availability', protect, isDoctor, addAvailability);
router.get('/availability', protect, isDoctor, getMyAvailability);
router.get('/availability/me', protect, isDoctor, getMyAvailability);
router.delete('/availability/:date/slots/:slotId', protect, isDoctor, deleteSlot);

// 2. Public Doctor Browsing & Directory Routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

module.exports = router;
