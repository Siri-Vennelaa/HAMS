const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

dotenv.config();

// Ensure SRV DNS works on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const sampleDoctors = [
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@hospital.com',
    password: 'Doctor@12345',
    phone: '+1-555-0101',
    gender: 'female',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    qualification: 'MD, FACC - Harvard Medical School',
    experience: 12,
    consultationFee: 1200,
    bio: 'Board-certified cardiologist specializing in preventive cardiology, heart failure, and coronary artery disease management.',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  },
  {
    name: 'Dr. James Anderson',
    email: 'james.anderson@hospital.com',
    password: 'Doctor@12345',
    phone: '+1-555-0102',
    gender: 'male',
    specialization: 'Neurologist',
    department: 'Neurology',
    qualification: 'MD, PhD - Johns Hopkins University',
    experience: 15,
    consultationFee: 1500,
    bio: 'Specialist in neurological disorders, stroke prevention, migraine treatments, and epilepsy management.',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@hospital.com',
    password: 'Doctor@12345',
    phone: '+1-555-0103',
    gender: 'female',
    specialization: 'Pediatrician',
    department: 'Pediatrics',
    qualification: 'MD - Stanford University School of Medicine',
    experience: 9,
    consultationFee: 800,
    bio: 'Dedicated pediatrician focused on infant health, childhood vaccinations, developmental screenings, and adolescent care.',
    profileImage: 'https://images.unsplash.com/photo-1594824813583-a4c32b509ec8?w=400',
  },
  {
    name: 'Dr. Robert Martinez',
    email: 'robert.martinez@hospital.com',
    password: 'Doctor@12345',
    phone: '+1-555-0104',
    gender: 'male',
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    qualification: 'MS (Ortho), MCh - Oxford University',
    experience: 14,
    consultationFee: 1100,
    bio: 'Expert in sports injury rehabilitation, joint replacement, arthroscopy, and spine disorders.',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
  },
  {
    name: 'Dr. Priya Patel',
    email: 'priya.patel@hospital.com',
    password: 'Doctor@12345',
    phone: '+1-555-0105',
    gender: 'female',
    specialization: 'Dermatologist',
    department: 'Dermatology',
    qualification: 'MD (Dermatology) - Columbia University',
    experience: 8,
    consultationFee: 900,
    bio: 'Clinical and cosmetic dermatologist handling eczema, psoriasis, acne therapy, and skin cancer screenings.',
    profileImage: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400',
  },
];

const standardSlots = [
  { time: '09:00 AM', isBooked: false },
  { time: '09:30 AM', isBooked: false },
  { time: '10:00 AM', isBooked: false },
  { time: '10:30 AM', isBooked: false },
  { time: '11:00 AM', isBooked: false },
  { time: '02:00 PM', isBooked: false },
  { time: '02:30 PM', isBooked: false },
  { time: '03:00 PM', isBooked: false },
  { time: '03:30 PM', isBooked: false },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from server/.env');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hospital.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // 1. Seed or Update Admin
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        phone: '+1-555-0001',
        gender: 'other',
        role: 'admin',
        address: 'Hospital Headquarters, Suite 100',
      });
      console.log(`[Seed] Created Admin account: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin account already exists: ${adminEmail}`);
    }

    // Helper to format dates as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = formatDate(dayAfter);

    const targetDates = [todayStr, tomorrowStr, dayAfterStr];

    // 2. Seed Doctors
    for (const docData of sampleDoctors) {
      let doctorUser = await User.findOne({ email: docData.email });
      if (!doctorUser) {
        doctorUser = await User.create({
          name: docData.name,
          email: docData.email,
          password: docData.password,
          phone: docData.phone,
          gender: docData.gender,
          role: 'doctor',
          address: 'Hospital Medical Complex, Wing B',
        });
        console.log(`[Seed] Created Doctor User: ${docData.name} (${docData.email})`);
      }

      // Check or create DoctorProfile
      let profile = await DoctorProfile.findOne({ userId: doctorUser._id });
      if (!profile) {
        profile = await DoctorProfile.create({
          userId: doctorUser._id,
          specialization: docData.specialization,
          department: docData.department,
          qualification: docData.qualification,
          experience: docData.experience,
          consultationFee: docData.consultationFee,
          bio: docData.bio,
          profileImage: docData.profileImage,
        });
        console.log(`[Seed] Created Doctor Profile for: ${docData.name}`);
      }

      // 3. Seed Sample Availability for each doctor for next 3 days
      for (const dateStr of targetDates) {
        const existingAvail = await Availability.findOne({
          doctorId: doctorUser._id,
          date: dateStr,
        });

        if (!existingAvail) {
          await Availability.create({
            doctorId: doctorUser._id,
            date: dateStr,
            slots: standardSlots.map((s) => ({ ...s })),
          });
        }
      }
    }

    console.log('[Seed] Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('----------------------------------------------------');
    console.log('Doctor Accounts (5 doctors created):');
    sampleDoctors.forEach((d) => {
      console.log(`- ${d.name} (${d.specialization}) | ${d.email} | Password: ${d.password}`);
    });
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
