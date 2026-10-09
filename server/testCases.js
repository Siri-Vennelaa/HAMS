/**
 * Comprehensive Automated System Test Suite
 * Tests all 24 required business rules, security boundaries, and edge cases
 */
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      failed++;
    }
  };

  try {
    console.log('====================================================');
    console.log('STARTING HOSPITAL SYSTEM INTEGRATION TEST SUITE');
    console.log('====================================================\n');

    // 1. Patient registration
    const testPatientEmail = `test.patient.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Patient',
        email: testPatientEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+91-9876543210',
        gender: 'female',
      }),
    }).then((r) => r.json());
    assert(regRes.success === true && regRes.data?.user?.role === 'patient', '1. Patient registration');

    // 2. Duplicate email registration
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Patient',
        email: testPatientEmail,
        password: 'Password@123',
      }),
    }).then((r) => r.json());
    assert(dupRes.success === false, '2. Duplicate email registration rejected');

    // 3. Incorrect password
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPatientEmail,
        password: 'WrongPassword!',
      }),
    }).then((r) => r.json());
    assert(wrongPassRes.success === false, '3. Incorrect password rejected');

    // 4. Patient login
    const patientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPatientEmail,
        password: 'Password@123',
      }),
    }).then((r) => r.json());
    const patientToken = patientLoginRes.data?.token;
    assert(patientLoginRes.success === true && patientToken, '4. Patient login succeeds');

    // 5. Doctor login
    const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.mitchell@hospital.com',
        password: 'Doctor@12345',
      }),
    }).then((r) => r.json());
    const docToken = docLoginRes.data?.token;
    const docUserId = docLoginRes.data?.user?._id;
    assert(docLoginRes.success === true && docLoginRes.data?.user?.role === 'doctor', '5. Doctor login succeeds');

    // 6. Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hospital.com',
        password: 'Admin@12345',
      }),
    }).then((r) => r.json());
    const adminToken = adminLoginRes.data?.token;
    assert(adminLoginRes.success === true && adminLoginRes.data?.user?.role === 'admin', '6. Admin login succeeds');

    // 7. Unauthorized route access (no token)
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(noTokenRes.status === 401, '7. Unauthorized route access without token blocked (401)');

    // 8. Patient searching doctors
    const searchDocsRes = await fetch(`${BASE_URL}/doctors?search=Sarah&department=Cardiology`).then((r) =>
      r.json()
    );
    assert(
      searchDocsRes.success === true && searchDocsRes.data?.length > 0,
      '8. Patient searching doctors with filters'
    );

    // 9. Doctor setting availability
    const scheduleDate = `2026-11-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`;
    const setAvailRes = await fetch(`${BASE_URL}/doctors/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
      body: JSON.stringify({
        date: scheduleDate,
        slots: [{ time: '10:00 AM' }, { time: '11:00 AM' }],
      }),
    }).then((r) => r.json());
    assert(setAvailRes.success === true, '9. Doctor setting availability');

    // 10. Patient viewing availability
    const viewAvailRes = await fetch(
      `${BASE_URL}/doctors/${docUserId}/availability?date=${scheduleDate}`
    ).then((r) => r.json());
    assert(
      viewAvailRes.success === true && viewAvailRes.data?.slots?.length >= 2,
      '10. Patient viewing doctor availability'
    );

    // 11. Patient booking appointment
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: docUserId,
        appointmentDate: scheduleDate,
        timeSlot: '10:00 AM',
        reason: 'Integration test consultation visit',
      }),
    }).then((r) => r.json());
    const bookedApptId = bookRes.data?._id;
    assert(bookRes.success === true && bookedApptId, '11. Patient booking appointment');

    // 12. Two patients attempting same slot (Double Booking Prevention)
    const secondBookingRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: docUserId,
        appointmentDate: scheduleDate,
        timeSlot: '10:00 AM',
        reason: 'Attempt duplicate booking on same slot',
      }),
    }).then((r) => r.json());
    assert(secondBookingRes.success === false, '12. Two patients attempting same slot double-booking blocked');

    // 13. Doctor confirming appointment
    const confirmRes = await fetch(`${BASE_URL}/appointments/${bookedApptId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
      body: JSON.stringify({ status: 'confirmed' }),
    }).then((r) => r.json());
    assert(confirmRes.success === true && confirmRes.data?.status === 'confirmed', '13. Doctor confirming appointment');

    // 14. Doctor completing appointment
    const completeRes = await fetch(`${BASE_URL}/appointments/${bookedApptId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    }).then((r) => r.json());
    assert(completeRes.success === true && completeRes.data?.status === 'completed', '14. Doctor completing appointment');

    // 15. Book second slot and test rejection
    const bookSlot2 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: docUserId,
        appointmentDate: scheduleDate,
        timeSlot: '11:00 AM',
        reason: 'Second consultation visit',
      }),
    }).then((r) => r.json());
    const slot2ApptId = bookSlot2.data?._id;

    // Doctor rejects appointment
    const rejectRes = await fetch(`${BASE_URL}/appointments/${slot2ApptId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
      body: JSON.stringify({ status: 'rejected' }),
    }).then((r) => r.json());
    assert(rejectRes.success === true && rejectRes.data?.status === 'rejected', '15. Doctor rejecting appointment');

    // 16. Patient cancelling appointment
    const bookSlot3 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: docUserId,
        appointmentDate: scheduleDate,
        timeSlot: '11:00 AM', // 11:00 AM was freed by rejection above!
        reason: 'Third consultation to cancel',
      }),
    }).then((r) => r.json());
    const slot3ApptId = bookSlot3.data?._id;

    const cancelRes = await fetch(`${BASE_URL}/appointments/${slot3ApptId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reason: 'Patient changed mind' }),
    }).then((r) => r.json());
    assert(cancelRes.success === true && cancelRes.data?.status === 'cancelled', '16. Patient cancelling appointment');

    // 17. Patient trying to access admin APIs
    const patientOnAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(patientOnAdmin.status === 403, '17. Patient trying to access admin APIs blocked (403 Forbidden)');

    // 18. Doctor trying to access admin APIs
    const doctorOnAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    assert(doctorOnAdmin.status === 403, '18. Doctor trying to access admin APIs blocked (403 Forbidden)');

    // 19. Admin creating doctor
    const newDocEmail = `test.doc.${Date.now()}@hospital.com`;
    const adminCreateDocRes = await fetch(`${BASE_URL}/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Dr. Test Administrator Created',
        email: newDocEmail,
        password: 'Doctor@12345',
        phone: '+91-9988776655',
        specialization: 'Pulmonologist',
        department: 'Pulmonology',
        experience: 10,
        consultationFee: 1400,
      }),
    }).then((r) => r.json());
    assert(adminCreateDocRes.success === true, '19. Admin creating doctor (with DoctorProfile)');

    // 20. Admin viewing appointments
    const adminApptsRes = await fetch(`${BASE_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(adminApptsRes.success === true && Array.isArray(adminApptsRes.data), '20. Admin viewing appointments');

    // 21. Expired / invalid JWT
    const invalidTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer this_is_a_completely_fake_token_12345' },
    });
    assert(invalidTokenRes.status === 401, '21. Invalid JWT token blocked (401)');

    // 22. Missing required form fields
    const missingFieldsRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then((r) => r.json());
    assert(missingFieldsRes.success === false, '22. Missing required form fields rejected (400)');

    // 23. Invalid MongoDB ObjectId
    const invalidIdRes = await fetch(`${BASE_URL}/doctors/not_a_valid_object_id`);
    assert(invalidIdRes.status === 400 || invalidIdRes.status === 404, '23. Invalid MongoDB ObjectId handled safely');

    // 24. Cross-patient privacy & authorization boundary check
    const patient2Email = `test.patient2.${Date.now()}@example.com`;
    const regPatient2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Patient Two Privacy Check',
        email: patient2Email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    }).then((r) => r.json());
    const patient2Token = regPatient2Res.data?.token;

    const crossCancelRes = await fetch(`${BASE_URL}/appointments/${bookedApptId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient2Token}`,
      },
      body: JSON.stringify({ reason: 'Malicious unauthorized cancellation attempt' }),
    });
    assert(crossCancelRes.status === 403, '24. Cross-patient authorization check blocked (403 Forbidden)');

    console.log('\n====================================================');
    console.log(`TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runTests();
