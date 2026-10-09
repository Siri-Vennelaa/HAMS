const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

/**
 * @desc    Get dashboard statistics for Admin
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [totalDoctors, totalPatients, totalAppointments, todayAppointments, recentAppointments] =
      await Promise.all([
        User.countDocuments({ role: 'doctor' }),
        User.countDocuments({ role: 'patient' }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ appointmentDate: todayStr }),
        Appointment.find()
          .populate('patientId', 'name email phone')
          .populate('doctorId', 'name email phone')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    // Also count by status
    const [pendingCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: { $in: ['cancelled', 'rejected'] } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments,
        statusBreakdown: {
          pending: pendingCount,
          confirmed: confirmedCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors for management
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
const getAdminDoctors = async (req, res, next) => {
  try {
    const doctorUsers = await User.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 });

    const doctorIds = doctorUsers.map((d) => d._id);
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const doctors = doctorUsers.map((doc) => {
      const p = profileMap.get(doc._id.toString());
      return {
        _id: doc._id,
        doctorId: doc._id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        specialization: p?.specialization || 'Not specified',
        department: p?.department || 'Not specified',
        qualification: p?.qualification || '',
        experience: p?.experience || 0,
        consultationFee: p?.consultationFee || 0,
        bio: p?.bio || '',
        profileImage: p?.profileImage || '',
        createdAt: doc.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin creates a new Doctor user and DoctorProfile
 * @route   POST /api/admin/doctors
 * @access  Private (Admin only)
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      department,
      qualification,
      experience,
      consultationFee,
      bio,
      profileImage,
    } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, specialization, and department are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Explicitly enforce doctor role
    const doctorUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: 'doctor',
    });

    const doctorProfile = await DoctorProfile.create({
      userId: doctorUser._id,
      specialization: specialization.trim(),
      department: department.trim(),
      qualification: qualification ? qualification.trim() : 'MD',
      experience: experience !== undefined ? Number(experience) : 0,
      consultationFee: consultationFee !== undefined ? Number(consultationFee) : 100,
      bio: bio ? bio.trim() : '',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      data: {
        _id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        specialization: doctorProfile.specialization,
        department: doctorProfile.department,
        qualification: doctorProfile.qualification,
        experience: doctorProfile.experience,
        consultationFee: doctorProfile.consultationFee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin updates doctor details
 * @route   PUT /api/admin/doctors/:id
 * @access  Private (Admin only)
 */
const updateDoctor = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Doctor ID.' });
    }

    const {
      name,
      phone,
      specialization,
      department,
      qualification,
      experience,
      consultationFee,
      bio,
      profileImage,
    } = req.body;

    const doctorUser = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctorUser) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    if (name) doctorUser.name = name.trim();
    if (phone !== undefined) doctorUser.phone = phone.trim();
    await doctorUser.save();

    let profile = await DoctorProfile.findOne({ userId: doctorUser._id });
    if (!profile) {
      profile = new DoctorProfile({ userId: doctorUser._id });
    }

    if (specialization) profile.specialization = specialization.trim();
    if (department) profile.department = department.trim();
    if (qualification) profile.qualification = qualification.trim();
    if (experience !== undefined) profile.experience = Number(experience);
    if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
    if (bio !== undefined) profile.bio = bio;
    if (profileImage) profile.profileImage = profileImage;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: {
        _id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        specialization: profile.specialization,
        department: profile.department,
        qualification: profile.qualification,
        experience: profile.experience,
        consultationFee: profile.consultationFee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin deletes or deactivates doctor
 * @route   DELETE /api/admin/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Doctor ID.' });
    }

    const doctorUser = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctorUser) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Delete user, profile, and availability
    await Promise.all([
      User.findByIdAndDelete(doctorUser._id),
      DoctorProfile.findOneAndDelete({ userId: doctorUser._id }),
      Availability.deleteMany({ doctorId: doctorUser._id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Doctor account and associated profile removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all patients
 * @route   GET /api/admin/patients
 * @access  Private (Admin only)
 */
const getAdminPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a patient
 * @route   DELETE /api/admin/patients/:id
 * @access  Private (Admin only)
 */
const deletePatient = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Patient ID.' });
    }

    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await User.findByIdAndDelete(patient._id);

    res.status(200).json({
      success: true,
      message: 'Patient account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments with filters for Admin
 * @route   GET /api/admin/appointments
 * @access  Private (Admin only)
 */
const getAdminAppointments = async (req, res, next) => {
  try {
    const { date, status, doctorId } = req.query;
    let query = {};

    if (date) query.appointmentDate = date;
    if (status) query.status = status;
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      query.doctorId = doctorId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone gender')
      .populate('doctorId', 'name email phone')
      .sort({ appointmentDate: -1, timeSlot: 1 });

    // Fetch doctor profiles to attach department
    const doctorIds = [...new Set(appointments.map((a) => a.doctorId?._id).filter(Boolean))];
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enriched = appointments.map((appt) => {
      const doc = appt.doctorId ? appt.doctorId.toObject() : null;
      const prof = doc ? profileMap.get(doc._id.toString()) : null;

      return {
        ...appt.toObject(),
        doctorProfile: prof || { department: 'General Care', specialization: 'Doctor' },
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminPatients,
  deletePatient,
  getAdminAppointments,
};
