const express = require('express');
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { isPatient } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/profile', protect, isPatient, getPatientProfile);
router.put('/profile', protect, isPatient, updatePatientProfile);

module.exports = router;
