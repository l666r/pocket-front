import React, { useState } from 'react';
import { API_URL } from '../config.js';

export default function OnboardingView({ user, onComplete, showToast, currentCity = 'Kochi' }) {
  const [selectedLikes, setSelectedLikes] = useState([
    'movies',
    'travel',
    'cafes',
    'transit',
    'heritage',
    'events',
    'sunsets',
  ]);

  const [selectedDislikes, setSelectedDislikes] = useState([]);
  const [saving, setSaving] = useState(false);

  const vibeOptions = [
    {
      id: 'movies',
      label: 'Movies & Cinema',
      icon: '🎬',
      desc: 'Local multiplexes, new releases, IMAX screenings & showtimes',
    },
    {
      id: 'travel',
      label: 'Travel Itineraries',
      icon: '🗺️',
      desc: 'Curated multi-day tours, scenic stops & route maps',
    },
    {
      id: 'cafes',
      label: 'Aesthetic Cafes & Food',
      icon: '☕',
      desc: 'Artisan roasteries, waterfront dining & authentic street food',
    },
    {
      id: 'transit',
      label: 'Smart Transit & Ferries',
      icon: '⛴️',
      desc: 'Water metro, scenic boat routes, rapid trains & metro lines',
    },
    {
      id: 'heritage',
      label: 'Heritage & Culture',
      icon: '🏛️',
      desc: 'Ancient palaces, synagogues, art biennales & museums',
    },
    {
      id: 'events',
      label: 'Live Events & Festivals',
      icon: '🎵',
      desc: 'Rooftop gigs, cultural recitals, concerts & flea markets',
    },
    {
      id: 'sunsets',
      label: 'Golden Hour & Sunsets',
      icon: '🌅',
      desc: 'Waterfront promenades, lighthouse walks & photo viewpoints',
    },
  ];

  const avoidanceOptions = [
    { id: 'crowds', label: 'Avoid Heavy Crowds', icon: '👥' },
    { id: 'budget', label: 'Budget Under ₹2,000 / $30 a day', icon: '💸' },
    { id: 'walking', label: 'Minimal Walking (<1.5 km)', icon: '🚶' },
    { id: 'late_night', label: 'Daytime Only (Wrap up by 8 PM)', icon: '☀️' },
  ];

  const toggleLike = (id) => {
    setSelectedLikes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDislike = (id) => {
    setSelectedDislikes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedLikes.length === 0) {
      showToast('Please select at least 1 interest to personalize your experience', 'warning');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('pocketroute_token');
      const userId = user?.id || user?._id || 'guest';

      const res = await fetch(`${API_URL}/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          likes: selectedLikes,
          dislikes: selectedDislikes,
          selectedCity: currentCity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Your personalized preferences are saved to database!', 'success');
        onComplete({
          likes: selectedLikes,
          dislikes: selectedDislikes,
          selectedCity: currentCity,
        });
      } else {
        // Fallback for session
        onComplete({
          likes: selectedLikes,
          dislikes: selectedDislikes,
          selectedCity: currentCity,
        });
      }
    } catch (err) {
      console.warn('Preferences saved locally in session:', err);
      onComplete({
        likes: selectedLikes,
        dislikes: selectedDislikes,
        selectedCity: currentCity,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-stage-wrap animate-fade-in">
      <div className="card-box onboarding-card">
        <div className="onboarding-header">
          <div className="onboarding-step-pill">Step 2 of 2 • Personalization</div>
          <h2 className="onboarding-title">Select Your Vibe</h2>
          <p className="onboarding-subtitle">
            Tell PocketRoute what you enjoy. Your dashboard, itineraries, and map explorer will adapt specifically to your selections in <b>{currentCity}</b>.
          </p>
        </div>

        {/* Section 1: Likes Grid */}
        <div className="onboarding-section">
          <div className="section-label-group">
            <span className="sl-title">✨ What excites you most? (Select your likes)</span>
            <span className="sl-count">{selectedLikes.length} Selected</span>
          </div>

          <div className="vibe-choice-grid">
            {vibeOptions.map((opt) => {
              const isSelected = selectedLikes.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  className={`vibe-tile ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleLike(opt.id)}
                >
                  <div className="vt-top">
                    <span className="vt-icon">{opt.icon}</span>
                    <span className={`vt-check-circle ${isSelected ? 'checked' : ''}`}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </div>
                  <div className="vt-label">{opt.label}</div>
                  <div className="vt-desc">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Avoidances / Dislikes */}
        <div className="onboarding-section" style={{ marginTop: '24px' }}>
          <div className="section-label-group">
            <span className="sl-title">🛡️ Preferences & Avoidance Toggles</span>
            <span className="sl-count">{selectedDislikes.length} Active</span>
          </div>

          <div className="avoidance-pills-row">
            {avoidanceOptions.map((opt) => {
              const isDisliked = selectedDislikes.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  className={`avoid-pill ${isDisliked ? 'active' : ''}`}
                  onClick={() => toggleDislike(opt.id)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  {isDisliked && <span className="pill-x">✕</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="onboarding-footer">
          <button
            type="button"
            className="btn-prime btn-launch-dash"
            onClick={handleSavePreferences}
            disabled={saving}
          >
            <span>{saving ? 'Saving Preferences...' : 'Launch My Personalized Dashboard'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
