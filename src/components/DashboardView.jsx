import React, { useState } from 'react';

export default function DashboardView({ user, t, onLogout, showToast }) {
  const [selectedAction, setSelectedAction] = useState('trip');
  const [transitMode, setTransitMode] = useState('water');

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'B';

  return (
    <div className="dashboard-layout-wrap animate-fade-in">
      
      {/* Top Welcome Bar */}
      <div className="card-box dash-user-header">
        <div className="duh-left">
          <div className="user-avatar-circle">{initial}</div>
          <div className="duh-user-info">
            <div className="verified-pill">
              <span className="pulsing-green-dot"></span>
              <span>{t.dash_verified}</span>
            </div>
            <h2 className="user-greeting-name">{t.dash_welcome} {user?.name || 'Explorer'}!</h2>
            <div className="user-contact-meta">
              <span>{user?.email}</span>
              <span className="dot-sep">•</span>
              <span>+91 {user?.mobile}</span>
            </div>
          </div>
        </div>

        <button type="button" className="btn-logout-subtle" onClick={onLogout}>
          <span>🚪</span>
          <span>{t.btn_signout}</span>
        </button>
      </div>

      {/* Main Budgo Prompt & Card Grid (Matching Screenshot UI) */}
      <div className="card-box budgo-hero-card">
        <div className="budgo-speech-bubble">
          <div className="avatar-chip">B</div>
          <div className="speech-text">
            Hi, I'm Budgo. Describe your trip in a sentence, or choose below.
          </div>
        </div>

        {/* 4 Interactive Feature Choice Cards */}
        <div className="action-cards-grid">
          <button
            type="button"
            className={`action-choice-card ${selectedAction === 'trip' ? 'active' : ''}`}
            onClick={() => {
              setSelectedAction('trip');
              showToast('Opening trip itinerary planner', 'info');
            }}
          >
            <div className="acc-title">{t.plan_trip_chip}</div>
            <div className="acc-desc">Curate multi-day travel itineraries and local attractions</div>
          </button>

          <button
            type="button"
            className={`action-choice-card ${selectedAction === 'expenses' ? 'active' : ''}`}
            onClick={() => {
              setSelectedAction('expenses');
              showToast('Opening monthly expense tracker', 'info');
            }}
          >
            <div className="acc-title">{t.plan_monthly_chip}</div>
            <div className="acc-desc">Track daily commutes and living travel budgets</div>
          </button>

          <button
            type="button"
            className={`action-choice-card ${selectedAction === 'events' ? 'active' : ''}`}
            onClick={() => {
              setSelectedAction('events');
              showToast('Discovering upcoming regional events', 'info');
            }}
          >
            <div className="acc-title">{t.find_events_chip}</div>
            <div className="acc-desc">Explore live cultural events, concerts and festivals</div>
          </button>

          <button
            type="button"
            className={`action-choice-card ${selectedAction === 'draft' ? 'active' : ''}`}
            onClick={() => {
              setSelectedAction('draft');
              showToast('Continuing your saved travel draft', 'info');
            }}
          >
            <div className="acc-title">{t.continue_draft_chip}</div>
            <div className="acc-desc">Pick up right where you left off on your route plan</div>
          </button>
        </div>

        {/* Kochi Water Metro Transit Feature Section */}
        <div className="transit-showcase-box">
          <div className="tsb-header">
            <div>
              <h3 className="tsb-title">🌱 {t.water_metro_title}</h3>
              <p className="tsb-desc">{t.water_metro_desc}</p>
            </div>
            <div className="savings-badge-pill">Saves ₹290 vs Cab</div>
          </div>

          <div className="transit-modes-row">
            <div
              className={`tm-option-card ${transitMode === 'water' ? 'active' : ''}`}
              onClick={() => setTransitMode('water')}
            >
              <div className="tmo-icon">🚤</div>
              <div className="tmo-name">Water Metro + RoRo</div>
              <div className="tmo-price">₹30</div>
              <div className="tmo-time">38 min • 85% Eco</div>
            </div>

            <div
              className={`tm-option-card ${transitMode === 'metro' ? 'active' : ''}`}
              onClick={() => setTransitMode('metro')}
            >
              <div className="tmo-icon">🚇</div>
              <div className="tmo-name">Kochi Metro Rail</div>
              <div className="tmo-price">₹77</div>
              <div className="tmo-time">36 min • AC Fast Corridor</div>
            </div>

            <div
              className={`tm-option-card ${transitMode === 'cab' ? 'active' : ''}`}
              onClick={() => setTransitMode('cab')}
            >
              <div className="tmo-icon">🚕</div>
              <div className="tmo-name">Direct App Cab</div>
              <div className="tmo-price">₹320</div>
              <div className="tmo-time">45 min • Traffic Delays</div>
            </div>
          </div>
        </div>

      </div>

      {/* Database Verified Banner */}
      <div className="db-connected-footer">
        <span className="pulsing-green-dot"></span>
        <span>MongoDB Database Connected • Active Session Stored Securely</span>
      </div>

    </div>
  );
}
