import React from 'react';
import { Calendar, Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

const AppointmentTable = ({
  appointments = [],
  role = 'patient',
  onCancel,
  onUpdateStatus,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6c757d' }}>Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={36} color="#6c757d" style={{ marginBottom: '10px' }} />
        <h4 style={{ color: '#212529', marginBottom: '6px' }}>No Appointments Found</h4>
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          There are currently no scheduled appointments in this view.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="app-table">
        <thead>
          <tr>
            <th>{role === 'doctor' ? 'Patient' : 'Doctor'}</th>
            <th>Specialization / Dept</th>
            <th>Date & Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => {
            const isPatient = role === 'patient';
            const displayName = isPatient
              ? appt.doctorId?.name || 'Doctor'
              : appt.patientId?.name || 'Patient';
            const dept = isPatient
              ? appt.doctorProfile?.department || 'Medical Care'
              : 'Consultation';

            const canCancel =
              (appt.status === 'pending' || appt.status === 'confirmed') && onCancel;

            return (
              <tr key={appt._id}>
                <td>
                  <strong>{displayName}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    {isPatient ? appt.doctorId?.email : appt.patientId?.phone || appt.patientId?.email}
                  </div>
                </td>
                <td>{dept}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#0d6efd" />
                    <span>{appt.appointmentDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6c757d', marginTop: '2px' }}>
                    <Clock size={14} />
                    <span>{appt.timeSlot}</span>
                  </div>
                </td>
                <td style={{ maxWidth: '240px' }}>
                  <span title={appt.reason}>
                    {appt.reason.length > 50 ? `${appt.reason.substring(0, 50)}...` : appt.reason}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Doctor Action Buttons */}
                    {role === 'doctor' && appt.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onUpdateStatus && onUpdateStatus(appt._id, 'confirmed')}
                          title="Confirm Appointment"
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onUpdateStatus && onUpdateStatus(appt._id, 'rejected')}
                          title="Reject Appointment"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {role === 'doctor' && appt.status === 'confirmed' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onUpdateStatus && onUpdateStatus(appt._id, 'completed')}
                        title="Mark Completed"
                      >
                        Complete
                      </button>
                    )}

                    {/* Patient / Admin Cancel Action */}
                    {canCancel && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onCancel(appt._id)}
                      >
                        <XCircle size={14} />
                        <span>Cancel</span>
                      </button>
                    )}

                    {!canCancel && role === 'patient' && (
                      <span style={{ fontSize: '0.8rem', color: '#adb5bd' }}>No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
