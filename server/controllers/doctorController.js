const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Availability = require('../models/Availability');

/**
 * @desc    Get all doctors with profile details and optional search/filtering
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, department } = req.query;

    // Filter criteria for DoctorProfile
    let profileQuery = {};
    if (specialization) {
      profileQuery.specialization = new RegExp(specialization, 'i');
    }
    if (department) {
      profileQuery.department = new RegExp(department, 'i');
    }

    // Find doctor profiles matching department/specialization
    let profiles = await DoctorProfile.find(profileQuery).populate('userId', 'name email phone');

    // If search keyword provided, filter by doctor name or specialization
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      profiles = profiles.filter((p) => {
        const docName = p.userId ? p.userId.name : '';
        return searchRegex.test(docName) || searchRegex.test(p.specialization) || searchRegex.test(p.department);
      });
    }

    // Format response to combine User and DoctorProfile cleanly
    const formattedDoctors = profiles
      .filter((p) => p.userId) // Ensure linked user exists
      .map((p) => ({
        _id: p.userId._id,
        doctorId: p.userId._id,
        profileId: p._id,
        name: p.userId.name,
        email: p.userId.email,
        phone: p.userId.phone,
        specialization: p.specialization,
        department: p.department,
        qualification: p.qualification,
        experience: p.experience,
        consultationFee: p.consultationFee,
        bio: p.bio,
        profileImage: p.profileImage,
      }));

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Doctor ID format.',
      });
    }

    const doctorUser = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const profile = await DoctorProfile.findOne({ userId: doctorUser._id });

    res.status(200).json({
      success: true,
      data: {
        _id: doctorUser._id,
        doctorId: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        specialization: profile?.specialization || 'General Practitioner',
        department: profile?.department || 'General Medicine',
        qualification: profile?.qualification || '',
        experience: profile?.experience || 0,
        consultationFee: profile?.consultationFee || 0,
        bio: profile?.bio || '',
        profileImage: profile?.profileImage || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor availability for a specific date
 * @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
 * @access  Public
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Doctor ID format.',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date parameter (YYYY-MM-DD)',
      });
    }

    const availability = await Availability.findOne({ doctorId: id, date });

    res.status(200).json({
      success: true,
      data: availability || { doctorId: id, date, slots: [] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in doctor's profile
 * @route   GET /api/doctors/profile/me
 * @access  Private (Doctor only)
 */
const getMyDoctorProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current doctor's profile
 * @route   PUT /api/doctors/profile
 * @access  Private (Doctor only)
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    const { name, phone, specialization, department, qualification, experience, consultationFee, bio, profileImage } =
      req.body;

    // Update user info
    if (name || phone) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      });
    }

    // Update or create doctor profile
    let profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new DoctorProfile({ userId: req.user._id });
    }

    if (specialization) profile.specialization = specialization;
    if (department) profile.department = department;
    if (qualification) profile.qualification = qualification;
    if (experience !== undefined) profile.experience = Number(experience);
    if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
    if (bio !== undefined) profile.bio = bio;
    if (profileImage) profile.profileImage = profileImage;

    await profile.save();

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: {
        user: updatedUser,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or update doctor availability for a selected date
 * @route   POST /api/doctors/availability
 * @access  Private (Doctor only)
 */
const addAvailability = async (req, res, next) => {
  try {
    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date (YYYY-MM-DD) and a non-empty array of slots.',
      });
    }

    // Find existing availability or create new
    let availability = await Availability.findOne({ doctorId: req.user._id, date });

    if (availability) {
      // Append only unique times
      const existingTimes = new Set(availability.slots.map((s) => s.time));
      const newSlots = slots
        .filter((s) => !existingTimes.has(s.time))
        .map((s) => ({ time: s.time, isBooked: false }));

      availability.slots.push(...newSlots);
      await availability.save();
    } else {
      availability = await Availability.create({
        doctorId: req.user._id,
        date,
        slots: slots.map((s) => ({ time: s.time, isBooked: false })),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Doctor availability updated successfully',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all availability dates for the logged in doctor
 * @route   GET /api/doctors/availability
 * @access  Private (Doctor only)
 */
const getMyAvailability = async (req, res, next) => {
  try {
    const schedules = await Availability.find({ doctorId: req.user._id }).sort({ date: 1 });
    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an unbooked slot from doctor availability
 * @route   DELETE /api/doctors/availability/:date/slots/:slotId
 * @access  Private (Doctor only)
 */
const deleteSlot = async (req, res, next) => {
  try {
    const { date, slotId } = req.params;

    const availability = await Availability.findOne({ doctorId: req.user._id, date });
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability schedule for this date not found.',
      });
    }

    const slot = availability.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found.',
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a slot that is already booked by a patient.',
      });
    }

    availability.slots.pull(slotId);
    await availability.save();

    res.status(200).json({
      success: true,
      message: 'Time slot removed successfully.',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getMyDoctorProfile,
  updateDoctorProfile,
  addAvailability,
  getMyAvailability,
  deleteSlot,
};
