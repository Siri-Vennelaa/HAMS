import React, { useState, useEffect } from 'react';
import { Search, Filter, Stethoscope, RotateCcw, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import doctorService from '../../services/doctorService';
import '../../styles/dashboard.css';

const FindDoctors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Available departments list
  const departments = [
    'All Departments',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'General Medicine',
  ];

  // Fetch doctors from backend with current filters
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (department && department !== 'All Departments') params.department = department;
      if (specialization.trim()) params.specialization = specialization.trim();

      const response = await doctorService.getDoctors(params);
      if (response && response.success) {
        setDoctors(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    setSpecialization('');
    // Trigger reset fetch
    doctorService.getDoctors().then((res) => {
      if (res?.success) setDoctors(res.data);
    });
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Find Doctors" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Hospital Doctor Directory</h1>
              <p>Find, consult, and schedule appointments with certified specialists across departments.</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ marginBottom: '28px', padding: '20px' }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  alignItems: 'flex-end',
                }}
              >
                {/* Search Input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Search Doctor or Specialty</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search
                      size={18}
                      color="#6c757d"
                      style={{ position: 'absolute', left: '12px' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Sarah, Heart, Bone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {/* Department Dropdown */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Department</label>
                  <select
                    className="form-control"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleReset}
                    title="Reset all filters"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <span style={{ fontSize: '0.92rem', color: '#495057', fontWeight: 600 }}>
              Available Doctors ({doctors.length})
            </span>
            {(search || department) && (
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Filtered by:{' '}
                {[search && `"${search}"`, department].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Doctors Grid / Empty State */}
          {loading ? (
            <LoadingSpinner fullPage message="Searching specialist doctors..." />
          ) : doctors.length > 0 ? (
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.doctorId || doctor._id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Stethoscope size={48} color="#6c757d" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#212529', marginBottom: '8px' }}>No Doctors Found</h3>
              <p style={{ color: '#6c757d', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                No specialist matched your filter criteria. Try adjusting your search query or clear the filters.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleReset}>
                <RotateCcw size={16} />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FindDoctors;
