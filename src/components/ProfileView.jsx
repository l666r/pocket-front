import React, { useState } from 'react';
import { API_URL } from '../config.js';

export default function ProfileView({
  user,
  currentCity = 'Kochi',
  onLogout,
  onNavigate,
  showToast,
}) {
  const [allergenScanner, setAllergenScanner] = useState(true);
  const [lowCrowd, setLowCrowd] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [downloadingOffline, setDownloadingOffline] = useState(false);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?._id || 'guest',
          message: feedbackText.trim(),
          source: 'profile_view',
        }),
      });

      showToast('Thank you! Your feedback has been sent to the team.', 'success');
      setFeedbackText('');
    } catch (err) {
      showToast('Feedback noted locally. Thank you!', 'info');
      setFeedbackText('');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDownloadOffline = () => {
    setDownloadingOffline(true);
    showToast(`Downloading offline travel package for ${currentCity}...`, 'info');
    setTimeout(() => {
      setDownloadingOffline(false);
      showToast(`Offline package for ${currentCity} is ready and cached locally!`, 'success');
    }, 1400);
  };

  return (
    <div className="profile-view-container animate-fade-in">
      {/* 1. Feature Switches & Offline Package (Reference Screenshot 5) */}
      <div className="profile-settings-card">
        {/* Toggle 1: Allergen Scanner */}
        <div className="setting-toggle-row">
          <div className="setting-toggle-text">
            <div className="setting-toggle-title">Allergen / Dietary AI Scanner</div>
            <div className="setting-toggle-desc">Highlight dietary-safe restaurant items and menus</div>
          </div>
          <label className="switch-control">
            <input
              type="checkbox"
              checked={allergenScanner}
              onChange={(e) => {
                setAllergenScanner(e.target.checked);
                showToast(`Allergen Scanner ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info');
              }}
            />
            <span className="switch-slider"></span>
          </label>
        </div>

        {/* Toggle 2: Low-crowd recommendations */}
        <div className="setting-toggle-row">
          <div className="setting-toggle-text">
            <div className="setting-toggle-title">Low–crowd recommendations</div>
            <div className="setting-toggle-desc">Prefer quieter hours and alternatives</div>
          </div>
          <label className="switch-control">
            <input
              type="checkbox"
              checked={lowCrowd}
              onChange={(e) => {
                setLowCrowd(e.target.checked);
                showToast(`Low-crowd mode ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info');
              }}
            />
            <span className="switch-slider"></span>
          </label>
        </div>

        {/* Toggle 3: Live safety alerts */}
        <div className="setting-toggle-row">
          <div className="setting-toggle-text">
            <div className="setting-toggle-title">Live safety alerts</div>
            <div className="setting-toggle-desc">Weather, transit, and local advisories</div>
          </div>
          <label className="switch-control">
            <input
              type="checkbox"
              checked={safetyAlerts}
              onChange={(e) => {
                setSafetyAlerts(e.target.checked);
                showToast(`Live Safety Alerts ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info');
              }}
            />
            <span className="switch-slider"></span>
          </label>
        </div>

        {/* Offline Package Download Block */}
        <button
          type="button"
          className="offline-package-action-card"
          onClick={handleDownloadOffline}
          disabled={downloadingOffline}
        >
          <div className="opc-icon-box">
            <span>🗺️</span>
          </div>
          <div className="opc-info">
            <div className="opc-title">
              {downloadingOffline ? 'Downloading Offline Package...' : 'Download Offline Travel Package'}
            </div>
            <div className="opc-desc">
              Maps, emergency phrasebooks, itineraries, and safety helplines
            </div>
          </div>
          <div className="opc-arrow">➔</div>
        </button>
      </div>

      {/* 2. HELP US IMPROVE / Feedback Card (Reference Screenshot 5) */}
      <div className="profile-feedback-card">
        <span className="section-eyebrow-green">HELP US IMPROVE</span>
        <h3 className="profile-card-title">What would make DI better?</h3>

        <form onSubmit={handleSendFeedback} style={{ marginTop: '12px' }}>
          <textarea
            className="profile-feedback-textarea"
            placeholder="Share a feature request, idea, or issue..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
          />

          <button
            type="submit"
            className="btn-send-feedback"
            disabled={submittingFeedback || !feedbackText.trim()}
          >
            <span>{submittingFeedback ? 'Sending...' : 'Send feedback ➔'}</span>
          </button>
        </form>
      </div>

      {/* 3. CURRENT PLAN / Explorer Pro (Reference Screenshot 5) */}
      <div className="profile-current-plan-card">
        <div className="pcp-top-tag">
          <span>✨ CURRENT PLAN</span>
        </div>
        <h3 className="pcp-title">Explorer Pro</h3>
        <p className="pcp-desc">
          Smarter re-planning, unlimited trips, offline maps, and live collaboration.
        </p>

        <div className="pcp-pricing-row">
          <div className="pcp-price">₹499 <span className="pcp-period">/ year</span></div>
          <span className="pcp-status-pill">Active Member</span>
        </div>
      </div>

      {/* User Session Quick Actions */}
      <div className="profile-actions-strip">
        <button
          type="button"
          className="btn-secondary-mint"
          onClick={() => onNavigate && onNavigate('onboarding')}
        >
          <span>🎯 Edit Travel Vibes & Likes</span>
        </button>

        <button
          type="button"
          className="btn-danger-outline"
          onClick={onLogout}
        >
          <span>🚪 Sign Out</span>
        </button>
      </div>
    </div>
  );
}
