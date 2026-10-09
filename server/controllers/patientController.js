const User = require('../models/User');

/**
 * @desc    Get patient profile
 * @route   GET /api/patients/profile
 * @access  Private (Patient only)
 */
const getPatientProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patients/profile
 * @access  Private (Patient only)
 */
const updatePatientProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, dateOfBirth, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    // Update allowed fields only; role and email cannot be manipulated here
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || null;
    if (address !== undefined) user.address = address.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
};
