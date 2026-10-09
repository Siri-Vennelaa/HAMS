const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, time slot, and reason for visit are required.',
      });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Check doctor availability and verify slot is free
    const availability = await Availability.findOne({
      doctorId,
      date: appointmentDate,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor has no available schedule on this date.',
      });
    }

    const slotIndex = availability.slots.findIndex((s) => s.time === timeSlot);
    if (slotIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot does not exist on this date.',
      });
    }

    if (availability.slots[slotIndex].isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is no longer available. Please choose another time slot.',
      });
    }

    // Check existing active appointment to prevent double booking race condition
    const existingBooking = await Appointment.findOne({
      doctorId,
      appointmentDate,
      timeSlot,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    if (existingBooking) {
      // Mark slot booked to align state
      availability.slots[slotIndex].isBooked = true;
      await availability.save();

      return res.status(400).json({
        success: false,
        message: 'Selected slot is no longer available. Please pick another slot.',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      timeSlot,
      reason: reason.trim(),
      status: 'pending',
    });

    // Mark slot as booked in doctor availability
    availability.slots[slotIndex].isBooked = true;
    await availability.save();

    // Populate doctor info for response
    await appointment.populate('doctorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already booked for the selected date and time slot.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in patient with statistics
 * @route   GET /api/appointments/my
 * @access  Private (Patient only)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name email phone')
      .sort({ appointmentDate: -1, timeSlot: 1 });

    // Attach doctor profile details (department, specialization, fee)
    const doctorUserIds = [...new Set(appointments.map((a) => a.doctorId?._id).filter(Boolean))];
    const profiles = await DoctorProfile.find({ userId: { $in: doctorUserIds } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enrichedAppointments = appointments.map((appt) => {
      const docObj = appt.doctorId ? appt.doctorId.toObject() : null;
      const docProfile = docObj ? profileMap.get(docObj._id.toString()) : null;

      return {
        ...appt.toObject(),
        doctorProfile: docProfile || {
          specialization: 'General',
          department: 'General',
          consultationFee: 100,
        },
      };
    });

    // Compute patient statistics
    const today = new Date().toISOString().split('T')[0];
    const stats = {
      total: appointments.length,
      upcoming: appointments.filter(
        (a) => (a.status === 'confirmed' || a.status === 'pending') && a.appointmentDate >= today
      ).length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected').length,
    };

    // Find next upcoming appointment
    const nextUpcoming = enrichedAppointments
      .filter((a) => (a.status === 'confirmed' || a.status === 'pending') && a.appointmentDate >= today)
      .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))[0] || null;

    res.status(200).json({
      success: true,
      data: enrichedAppointments,
      stats,
      nextUpcoming,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in doctor
 * @route   GET /api/appointments/doctor
 * @access  Private (Doctor only)
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, filter } = req.query;
    let query = { doctorId: req.user._id };

    const todayStr = new Date().toISOString().split('T')[0];

    if (filter === 'today') {
      query.appointmentDate = todayStr;
    } else if (filter === 'upcoming') {
      query.appointmentDate = { $gte: todayStr };
      query.status = { $in: ['pending', 'confirmed'] };
    } else if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone gender dateOfBirth address')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    // Doctor stats
    const allDoctorAppts = await Appointment.find({ doctorId: req.user._id });
    const stats = {
      today: allDoctorAppts.filter((a) => a.appointmentDate === todayStr).length,
      upcoming: allDoctorAppts.filter((a) => a.appointmentDate >= todayStr && (a.status === 'pending' || a.status === 'confirmed')).length,
      completed: allDoctorAppts.filter((a) => a.status === 'completed').length,
      pending: allDoctorAppts.filter((a) => a.status === 'pending').length,
    };

    res.status(200).json({
      success: true,
      data: appointments,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Doctor confirms, rejects, or completes an appointment
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor only)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['confirmed', 'completed', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted values: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or you are not authorized to modify it.',
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    // If doctor rejected appointment, free up the slot in availability
    if (status === 'rejected') {
      const availability = await Availability.findOne({
        doctorId: appointment.doctorId,
        date: appointment.appointmentDate,
      });

      if (availability) {
        const slot = availability.slots.find((s) => s.time === appointment.timeSlot);
        if (slot) {
          slot.isBooked = false;
          await availability.save();
        }
      }
    }

    await appointment.populate('patientId', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Patient or Doctor cancels an appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Ensure only the patient who booked it, the doctor, or an admin can cancel
    const isOwnerPatient = appointment.patientId.toString() === req.user._id.toString();
    const isAssignedDoctor = appointment.doctorId.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this appointment.',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled.',
      });
    }

    appointment.status = 'cancelled';
    if (req.body.reason) {
      appointment.notes = `Cancelled: ${req.body.reason}`;
    }
    await appointment.save();

    // Free up doctor slot in Availability
    const availability = await Availability.findOne({
      doctorId: appointment.doctorId,
      date: appointment.appointmentDate,
    });

    if (availability) {
      const slot = availability.slots.find((s) => s.time === appointment.timeSlot);
      if (slot) {
        slot.isBooked = false;
        await availability.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. Time slot has been freed.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
