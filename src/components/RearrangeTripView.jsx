import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';

export default function RearrangeTripView({ user, onOpenShare, showToast }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch trips from MongoDB Atlas
  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/trips?userId=${user?.id || 'guest'}`);
      const data = await res.json();
      if (data.success && data.trips.length > 0) {
        setTrips(data.trips);
        setSelectedTrip(data.trips[0]);
      }
    } catch (err) {
      showToast('Error loading trips from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  // Re-order Move Up
  const handleMoveUp = (index) => {
    if (index === 0 || !selectedTrip) return;
    const newStops = [...selectedTrip.stops];
    const temp = newStops[index - 1];
    newStops[index - 1] = newStops[index];
    newStops[index] = temp;
    setSelectedTrip({ ...selectedTrip, stops: newStops });
    showToast(`Moved "${newStops[index - 1].name}" earlier in schedule`, 'info');
  };

  // Re-order Move Down
  const handleMoveDown = (index) => {
    if (!selectedTrip || index === selectedTrip.stops.length - 1) return;
    const newStops = [...selectedTrip.stops];
    const temp = newStops[index + 1];
    newStops[index + 1] = newStops[index];
    newStops[index] = temp;
    setSelectedTrip({ ...selectedTrip, stops: newStops });
    showToast(`Moved "${newStops[index + 1].name}" later in schedule`, 'info');
  };

  // Remove Stop
  const handleRemoveStop = (index) => {
    if (!selectedTrip) return;
    const removedName = selectedTrip.stops[index].name;
    const newStops = selectedTrip.stops.filter((_, i) => i !== index);
    setSelectedTrip({ ...selectedTrip, stops: newStops });
    showToast(`Removed "${removedName}" from itinerary`, 'info');
  };

  // Lock/Unlock Stop
  const handleToggleLock = (index) => {
    if (!selectedTrip) return;
    const newStops = [...selectedTrip.stops];
    newStops[index].isLocked = !newStops[index].isLocked;
    setSelectedTrip({ ...selectedTrip, stops: newStops });
    showToast(`Stop ${newStops[index].isLocked ? 'locked' : 'unlocked'}`, 'info');
  };

  // Save changes to MongoDB Atlas
  const handleSaveRearranged = async () => {
    if (!selectedTrip) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: selectedTrip.stops,
          title: selectedTrip.title,
          budget: selectedTrip.budget,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update trip');

      showToast('Trip schedule successfully updated and synced with cloud!', 'success');
      loadTrips();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel / Delete Trip
  const handleCancelTrip = async () => {
    if (!selectedTrip) return;
    if (!window.confirm(`Are you sure you want to cancel "${selectedTrip.title}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/trips/${selectedTrip._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel trip');

      showToast(`Trip "${selectedTrip.title}" cancelled.`, 'warning');
      loadTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/api/trips/${selectedTrip._id}/favorite`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTrip({ ...selectedTrip, isFavorite: data.isFavorite });
        showToast(data.isFavorite ? 'Added to My Favorites! ⭐' : 'Removed from Favorites', 'success');
        loadTrips();
      }
    } catch (err) {
      showToast('Error updating favorite', 'error');
    }
  };

  const [optimizing, setOptimizing] = useState(false);

  const handleAiOptimize = async () => {
    if (!selectedTrip || !selectedTrip._id) {
      showToast('Please select a trip to optimize', 'warning');
      return;
    }
    setOptimizing(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${selectedTrip._id}/optimize`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t._id === data.trip._id ? data.trip : t)));
        showToast('✨ Route re-ordered with AI! Backtracking eliminated and transit times optimized.', 'success');
      } else {
        showToast(data.message || 'Optimization failed', 'error');
      }
    } catch (err) {
      showToast('Error connecting to AI optimizer', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="rearrange-container">
      {/* Header */}
      <div className="plantrip-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--ink)' }}>Re-Arrange your Trip</h2>
          <p className="m" style={{ marginTop: '2px' }}>
            Modify stops, adjust times, re-order your schedule, or optimize route with AI
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-prime"
            style={{ width: 'auto', padding: '8px 16px', background: 'linear-gradient(135deg, #E5A93C, #D97706)' }}
            onClick={handleAiOptimize}
            disabled={optimizing}
            title="Automatically reorders stops to minimize travel time & cost"
          >
            <span>{optimizing ? 'Optimizing Route...' : '✨ 1-Click AI Route Optimizer'}</span>
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={handleToggleFavorite}
            title="Favorite Trip"
          >
            <span>{selectedTrip?.isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}</span>
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => {
              if (!selectedTrip) return;
              onOpenShare({
                type: 'trip',
                title: selectedTrip.title,
                subtitle: `${selectedTrip.destination} • ${selectedTrip.stops?.length || 0} stops`,
                shareUrl: `${window.location.origin}/#/share/trip/${selectedTrip.shareCode}`,
              });
            }}
          >
            <span>🔗</span> Share Plan
          </button>
          <button
            type="button"
            className="btn-prime"
            style={{ width: 'auto', padding: '8px 18px' }}
            onClick={handleSaveRearranged}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Re-Arranged Order'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner-dot" style={{ borderColor: 'var(--acc)', borderTopColor: 'transparent', width: '24px', height: '24px' }}></span>
          <div className="m" style={{ marginTop: '10px' }}>Loading planned trips from MongoDB Atlas...</div>
        </div>
      ) : (
        <div>
          {/* Active Trip Selector Ribbon */}
          {trips.length > 0 && (
            <div className="trip-selector-ribbon-container">
              <div className="trip-selector-ribbon">
                <span className="ribbon-label hide-on-mobile">Select Itinerary:</span>
                {trips.map((t) => {
                  const isSelected = selectedTrip?._id === t._id;
                  const isCancelled = t.status === 'cancelled';
                  return (
                    <button
                      key={t._id}
                      type="button"
                      className={`trip-selector-card-btn ${isSelected ? 'active' : ''} ${isCancelled ? 'is-cancelled' : ''}`}
                      onClick={() => setSelectedTrip(t)}
                    >
                      <span className="tsc-icon">{isCancelled ? '🚫' : t.isFavorite ? '⭐' : '🗺️'}</span>
                      <div className="tsc-content">
                        <span className="tsc-title">{t.title}</span>
                        <div className="tsc-sub">
                          <span>{t.days} Days</span>
                          <span>•</span>
                          <span className={`tsc-status-badge ${isCancelled ? 'cancelled' : 'active'}`}>
                            {isCancelled ? 'Cancelled' : 'Active'}
                          </span>
                        </div>
                      </div>
                      {isSelected && <span className="tsc-active-dot">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTrip && (
            <div>
              {/* Trip Overview Pill Bar */}
              <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div className="row">
                  <div>
                    <b style={{ fontSize: '18px' }}>{selectedTrip.title}</b>
                    <div className="m" style={{ marginTop: '4px' }}>
                      📍 {selectedTrip.destination} • {selectedTrip.days} days • Budget ₹{selectedTrip.budget?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`pill ${selectedTrip.status === 'cancelled' ? 'bad' : 'goods'}`}>
                      {selectedTrip.status === 'cancelled' ? 'Cancelled' : 'Active Plan'}
                    </span>
                    {selectedTrip.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="btn o sm"
                        style={{ color: 'var(--bad)', borderColor: 'rgba(180, 35, 24, 0.3)' }}
                        onClick={handleCancelTrip}
                      >
                        Cancel Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Stops Reorder List */}
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink)' }}>
                Re-order Itinerary Stops:
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedTrip.stops.map((stop, idx) => (
                  <div key={stop.id || idx} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="stop-badge-num" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="row">
                        <b style={{ fontSize: '14.5px' }}>{stop.name}</b>
                        <span style={{ fontWeight: '600', fontSize: '13.5px' }}>{stop.cost ? `₹${stop.cost} pp` : 'Free'}</span>
                      </div>
                      <div className="m" style={{ marginTop: '3px' }}>
                        {stop.time} • {stop.duration} • <span className="pill">{stop.category}</span>
                        {stop.isLocked && <span className="pill o" style={{ marginLeft: '6px' }}>Locked</span>}
                      </div>
                    </div>

                    {/* Reorder Up/Down Action Controls */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="nav-icon-btn"
                        style={{ padding: '6px 10px' }}
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        title="Move stop earlier in time"
                      >
                        ↑ Up
                      </button>
                      <button
                        type="button"
                        className="nav-icon-btn"
                        style={{ padding: '6px 10px' }}
                        disabled={idx === selectedTrip.stops.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        title="Move stop later in time"
                      >
                        ↓ Down
                      </button>
                      <button
                        type="button"
                        className="nav-icon-btn"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleToggleLock(idx)}
                        title={stop.isLocked ? 'Unlock stop' : 'Lock stop to prevent auto-changes'}
                      >
                        {stop.isLocked ? '🔓' : '🔒'}
                      </button>
                      <button
                        type="button"
                        className="nav-icon-btn"
                        style={{ padding: '6px 10px', color: 'var(--bad)' }}
                        onClick={() => handleRemoveStop(idx)}
                        title="Remove stop"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
