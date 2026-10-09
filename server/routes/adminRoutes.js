const express = require('express');
const {
  getAdminStats,
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminPatients,
  deletePatient,
  getAdminAppointments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce Admin-only access for all routes in this router
router.use(protect, isAdmin);

// Statistics
router.get('/stats', getAdminStats);

// Doctor Management
router.get('/doctors', getAdminDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Patient Management
router.get('/patients', getAdminPatients);
router.delete('/patients/:id', deletePatient);

// Appointment Management
router.get('/appointments', getAdminAppointments);

module.exports = router;
