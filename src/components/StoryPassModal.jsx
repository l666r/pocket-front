import React from 'react';

export default function StoryPassModal({ isOpen, onClose, trip, currentCity = 'Kochi', showToast }) {
  if (!isOpen) return null;

  const stops = trip?.stops || [
    { name: 'Chinese Fishing Nets Promenade', time: '09:00 AM' },
    { name: 'Water Metro Island Cruise', time: '12:00 PM' },
    { name: 'Heritage Art Cafe & Lunch', time: '02:30 PM' },
    { name: 'Marine Drive Waterfront Sunset', time: '05:45 PM' },
  ];

  return (
    <div className="modal-backdrop-scrim animate-fade-in" onClick={onClose}>
      <div className="card-box story-pass-card" onClick={(e) => e.stopPropagation()}>
        <div className="spc-top-bar">
          <span className="spc-tag">📸 9:16 INSTA-STORY TRAVEL PASS</span>
          <button type="button" className="msp-close" onClick={onClose}>✕</button>
        </div>

        {/* 9:16 Visual Snapshot Pass */}
        <div className="story-vertical-frame">
          <div className="svf-brand">
            <span className="svf-logo">Pocket<b>Route</b></span>
            <span className="svf-city">{currentCity.toUpperCase()} EDITION</span>
          </div>

          <div className="svf-hero">
            <h2 className="svf-title">{trip?.title || `${currentCity} Curated Route`}</h2>
            <div className="svf-meta">
              <span>{trip?.days || 2} Days</span> • <span>{trip?.weather || '29°C Sunny'}</span>
            </div>
          </div>

          <div className="svf-timeline">
            {stops.slice(0, 5).map((stop, i) => (
              <div key={i} className="svf-stop-item">
                <div className="svf-dot-line">
                  <span className="svf-dot"></span>
                  {i < Math.min(4, stops.length - 1) && <span className="svf-line"></span>}
                </div>
                <div className="svf-stop-info">
                  <div className="svf-stop-time">{stop.time}</div>
                  <div className="svf-stop-name">{stop.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="svf-footer">
            <div className="svf-qr-box">
              <span>📱 SCAN FOR LIVE GPS ROUTE</span>
            </div>
            <div className="svf-watermark">pocketroute.local • smart location intel</div>
          </div>
        </div>

        <div className="spc-actions">
          <button
            type="button"
            className="btn-prime"
            style={{ width: '100%' }}
            onClick={() => {
              showToast('Pass image ready! Take screenshot or save to gallery 📸', 'success');
            }}
          >
            <span>📥 Save / Share to Story</span>
          </button>
        </div>
      </div>
    </div>
  );
}
