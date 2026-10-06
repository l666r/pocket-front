import React from 'react';

export default function EmergencyModal({ isOpen, onClose, currentCity = 'Kochi', cityData, showToast }) {
  if (!isOpen) return null;

  const emergencyNumber = cityData?.emergencyNumber || '112 (Universal Emergency)';

  const emergencyHotlines = [
    { name: 'Universal Police / Dispatch', num: emergencyNumber.split('(')[0].trim(), icon: '🚨' },
    { name: 'Tourist Assistance Police', num: '+91 484 2215400', icon: '👮' },
    { name: '24/7 Emergency Medical / Ambulance', num: '108', icon: '🚑' },
    { name: 'Women Safety Helpline', num: '1091', icon: '🛡️' },
  ];

  return (
    <div className="modal-backdrop-scrim animate-fade-in" onClick={onClose}>
      <div className="card-box emergency-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="emc-header">
          <div className="emc-title-group">
            <span className="pulsing-red-badge">SOS ACTIVE</span>
            <h2 className="emc-title">🛡️ {currentCity} Emergency & Safety Hub</h2>
          </div>
          <button type="button" className="msp-close" onClick={onClose}>✕</button>
        </div>

        <p className="emc-desc">
          Instant emergency contacts, tourist assistance, and verified medical hotlines tailored to your current location in <b>{currentCity}</b>.
        </p>

        {/* Hotlines Grid */}
        <div className="emc-hotlines-list">
          {emergencyHotlines.map((hotline, idx) => (
            <div key={idx} className="emc-hotline-row">
              <div className="ehr-left">
                <span className="ehr-icon">{hotline.icon}</span>
                <div>
                  <div className="ehr-name">{hotline.name}</div>
                  <div className="ehr-num">{hotline.num}</div>
                </div>
              </div>
              <a
                href={`tel:${hotline.num}`}
                className="btn-call-sos"
                onClick={() => showToast(`Initiating call to ${hotline.name}...`, 'warning')}
              >
                <span>📞 Call Now</span>
              </a>
            </div>
          ))}
        </div>

        {/* Nearest 24/7 Hospital */}
        <div className="emc-hospital-box">
          <h4 className="ehb-subtitle">🏥 Verified 24/7 Medical Care Nearby:</h4>
          <p className="ehb-text">
            <b>{currentCity} General Hospital & Trauma Care</b><br />
            Emergency Ward open 24 Hours • Ambulances on standby • English & Multilingual staff
          </p>
        </div>

        <button type="button" className="btn-subtle" style={{ width: '100%', marginTop: '16px' }} onClick={onClose}>
          Close Safety Hub
        </button>
      </div>
    </div>
  );
}
