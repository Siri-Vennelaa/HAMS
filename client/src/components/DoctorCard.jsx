import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, UserCheck, X, Award, DollarSign, Stethoscope, Mail, Phone } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const [showModal, setShowModal] = useState(false);

  const fallbackImg =
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300';

  return (
    <>
      <div className="doctor-card">
        <div className="doctor-avatar-box">
          <img
            src={doctor.profileImage || fallbackImg}
            alt={doctor.name}
            onError={(e) => {
              e.target.src = fallbackImg;
            }}
          />
        </div>

        <div className="doctor-info-center">
          <h4 className="doctor-card-name">{doctor.name}</h4>
          <div className="doctor-card-spec">{doctor.specialization}</div>
          <div className="doctor-card-dept">{doctor.department}</div>
        </div>

        <div className="doctor-meta-list">
          <div className="doctor-meta-item">
            <span>Experience</span>
            <strong>{doctor.experience || 0} Years</strong>
          </div>
          <div className="doctor-meta-item" style={{ textAlign: 'right' }}>
            <span>Consultation Fee</span>
            <strong style={{ color: '#198754' }}>₹{doctor.consultationFee || 0}</strong>
          </div>
        </div>

        {doctor.qualification && (
          <p
            style={{
              fontSize: '0.8rem',
              color: '#6c757d',
              marginBottom: '16px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={doctor.qualification}
          >
            {doctor.qualification}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
            onClick={() => setShowModal(true)}
          >
            <UserCheck size={15} />
            <span>Profile</span>
          </button>
          <Link
            to={`/patient/book/${doctor.doctorId || doctor._id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <CalendarPlus size={15} />
            <span>Book</span>
          </Link>
        </div>
      </div>

      {/* Doctor Profile Details Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: 'var(--modal-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6c757d',
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '20px' }}>
              <img
                src={doctor.profileImage || fallbackImg}
                alt={doctor.name}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #e7f1ff',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#212529', marginBottom: '4px' }}>
                  {doctor.name}
                </h3>
                <div style={{ color: '#0d6efd', fontWeight: 600, fontSize: '0.95rem' }}>
                  {doctor.specialization} &bull; {doctor.department}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '2px' }}>
                  {doctor.qualification}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '0.88rem',
              }}
            >
              <div>
                <span style={{ color: '#6c757d' }}>Clinical Experience:</span>
                <div><strong>{doctor.experience || 0} Years Active</strong></div>
              </div>
              <div>
                <span style={{ color: '#6c757d' }}>Consultation Fee:</span>
                <div><strong style={{ color: '#198754' }}>₹{doctor.consultationFee || 0}</strong></div>
              </div>
              {doctor.email && (
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#6c757d" />
                  <span style={{ color: '#495057' }}>{doctor.email}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <h5 style={{ fontSize: '0.95rem', color: '#212529', marginBottom: '8px' }}>
                About the Doctor
              </h5>
              <p style={{ color: '#495057', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {doctor.bio || 'Experienced healthcare practitioner committed to patient-first treatment plans, modern diagnostic workflows, and quality clinical outcomes.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <Link
                to={`/patient/book/${doctor.doctorId || doctor._id}`}
                className="btn btn-primary btn-sm"
              >
                <CalendarPlus size={16} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorCard;
