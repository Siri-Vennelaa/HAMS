import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullPage = false }) => {
  const sizeMap = {
    sm: { diameter: '20px', border: '2px' },
    md: { diameter: '36px', border: '3px' },
    lg: { diameter: '54px', border: '4px' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const spinner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: currentSize.diameter,
          height: currentSize.diameter,
          border: `${currentSize.border} solid #e2e8f0`,
          borderTop: `${currentSize.border} solid var(--primary-color, #0d6efd)`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: 500 }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
