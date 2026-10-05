import React, { useState } from 'react';
import { API_URL } from '../config.js';

export default function PlanTripView({ user, onTripCreated, onOpenShare, showToast }) {
  const [destination, setDestination] = useState('Fort Kochi & Ernakulam');
  const [days, setDays] = useState(2);
  const [adults, setAdults] = useState(2);
  const [budget, setBudget] = useState(5000);
  const [trafficPace, setTrafficPace] = useState('Balanced (Water Metro + Auto)');
  const [weatherCondition, setWeatherCondition] = useState('Sunny & breezy, 29°C • Sunset at 6:18 PM');
  const [title, setTitle] = useState('Kochi 2-Day Smart Transit Tour');
  const [saving, setSaving] = useState(false);

  const [stops, setStops] = useState([
    { id: 'p1', name: 'Breakfast at Fort Kochi (Appam & Stew)', time: '08:30', duration: '45m', cost: 120, category: 'Food & Cafe', transitToNext: 'Walk • 6 min • Free', isLocked: false, day: 1 },
    { id: 'p2', name: 'Chinese Fishing Nets Heritage Promenade', time: '09:45', duration: '40m', cost: 0, category: 'Sight', transitToNext: 'Auto • 10 min • ₹80', isLocked: false, day: 1 },
    { id: 'p3', name: 'Mattancherry Dutch Palace', time: '11:00', duration: '1h 15m', cost: 10, category: 'Culture & Heritage', transitToNext: 'Walk • 5 min • Free', isLocked: true, day: 1 },
    { id: 'p4', name: 'Jew Town Antiques & Synagogue Walk', time: '12:30', duration: '1h', cost: 0, category: 'Culture & Heritage', transitToNext: 'Water Metro • 20 min • ₹30', isLocked: false, day: 1 },
    { id: 'p5', name: 'Marine Drive Waterfront Sunset Walk', time: '17:30', duration: '1h', cost: 0, category: 'Nature & Sunset', transitToNext: 'Metro • 15 min • ₹25', isLocked: false, day: 1 },
    { id: 'p6', name: 'Kathakali Evening Recital & Makeup Demo', time: '19:00', duration: '1h 30m', cost: 400, category: 'Culture & Heritage', transitToNext: 'End of Day', isLocked: false, day: 1 },
  ]);

  // Inline new stop inputs
  const [newStopName, setNewStopName] = useState('');
  const [newStopTime, setNewStopTime] = useState('14:30');
  const [newStopCost, setNewStopCost] = useState('');
  const [newStopCategory, setNewStopCategory] = useState('Sight');
  const [showAddStopModal, setShowAddStopModal] = useState(false);

  const totalCalculatedCost = stops.reduce((sum, s) => sum + (s.cost * adults), 0) + 1200; // includes transit/entry
  const budgetDelta = budget - totalCalculatedCost;

  const handleAddStop = (e) => {
    e.preventDefault();
    if (!newStopName.trim()) return;

    const newStop = {
      id: 'custom_' + Date.now(),
      name: newStopName.trim(),
      time: newStopTime || '14:00',
      duration: '1h',
      cost: Number(newStopCost) || 0,
      category: newStopCategory,
      transitToNext: 'Auto • 15 min • ₹80',
      isLocked: false,
      day: 1,
    };

    setStops([...stops, newStop]);
    setNewStopName('');
    setNewStopCost('');
    setShowAddStopModal(false);
    showToast(`Added "${newStop.name}" to trip plan`, 'success');
  };

  const handleSaveToCloud = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          destination,
          days,
          adults,
          budget,
          weather: weatherCondition,
          trafficPace,
          stops,
          userId: user?.id || 'guest',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save trip');

      showToast('Trip successfully saved to MongoDB Atlas!', 'success');
      if (onTripCreated) onTripCreated(data.trip);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="plantrip-container">
      {/* Header */}
      <div className="plantrip-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--ink)' }}>Plan the Trip</h2>
          <p className="m" style={{ marginTop: '2px' }}>
            Multi-factor optimization for Time, Budget, Traffic corridors, and Live Weather
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary-teal"
            style={{ width: 'auto', padding: '8px 18px', marginTop: 0 }}
            onClick={handleSaveToCloud}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Plan to Cloud'}
          </button>
        </div>
      </div>

      {/* Grid of Control Cards */}
      <div className="plantrip-grid-top">
        {/* Destination & Title */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Trip Title</label>
            <input
              className="auth-input"
              style={{ padding: '8px 12px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Destination</label>
            <select
              className="auth-input"
              style={{ padding: '8px 12px' }}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="Fort Kochi & Ernakulam">Fort Kochi & Ernakulam (Water Metro)</option>
              <option value="Munnar Hills">Munnar Hills & Tea Estates</option>
              <option value="Alleppey Backwaters">Alleppey Backwaters & Houseboat</option>
              <option value="Kakkanad Infopark Corridor">Kakkanad Infopark Tech Corridor</option>
            </select>
          </div>
        </div>

        {/* Live Weather & Traffic Pace */}
        <div className="card">
          <div className="row">
            <span style={{ fontWeight: '600', fontSize: '13.5px' }}>⛅ Live Weather Condition</span>
            <span className="pill">Kochi Coast</span>
          </div>
          <p className="m" style={{ margin: '6px 0 12px', color: 'var(--ink)' }}>
            {weatherCondition}
          </p>

          <div className="form-group">
            <label className="form-label">Traffic & Transit Pace</label>
            <select
              className="auth-input"
              style={{ padding: '8px 12px' }}
              value={trafficPace}
              onChange={(e) => setTrafficPace(e.target.value)}
            >
              <option value="Balanced (Water Metro + Auto)">Balanced (Water Metro + Auto combo • Low traffic)</option>
              <option value="Fast Express Corridor">Fast Express (Kochi Metro Rail Corridor)</option>
              <option value="Scenic Leisure">Scenic Leisure (Relaxed Ferry & Walking)</option>
            </select>
          </div>
        </div>

        {/* Budget & Travelers */}
        <div className="card">
          <div className="row">
            <span style={{ fontWeight: '600', fontSize: '13.5px' }}>💰 Target Budget</span>
            <b style={{ color: 'var(--acc)', fontSize: '16px' }}>₹{budget.toLocaleString('en-IN')}</b>
          </div>
          <input
            type="range"
            min="2000"
            max="30000"
            step="500"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--acc)', margin: '10px 0 6px' }}
          />
          <div className="m" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Est. Cost: ₹{totalCalculatedCost.toLocaleString('en-IN')}</span>
            <span style={{ color: budgetDelta >= 0 ? 'var(--acc)' : 'var(--bad)', fontWeight: '600' }}>
              {budgetDelta >= 0 ? `₹${budgetDelta} savings` : `₹${Math.abs(budgetDelta)} over`}
            </span>
          </div>

          <div className="row" style={{ marginTop: '12px' }}>
            <span className="m">Travelers ({adults} Adults)</span>
            <span className="st">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>
              <b>{adults}</b>
              <button type="button" onClick={() => setAdults(adults + 1)}>+</button>
            </span>
          </div>
        </div>
      </div>

      {/* Itinerary Stops List */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--ink)' }}>
            Scheduled Stops ({stops.length} stops)
          </h3>
          <button
            type="button"
            className="btn-secondary-mint"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '12.5px' }}
            onClick={() => setShowAddStopModal(true)}
          >
            + Add Stop
          </button>
        </div>

        <div className="stops-timeline-wrap">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="card stop-item-card">
              <div className="stop-badge-num">{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="row">
                  <b style={{ fontSize: '15px' }}>{stop.name}</b>
                  <span style={{ fontWeight: '600' }}>{stop.cost ? `₹${stop.cost} pp` : 'Free'}</span>
                </div>
                <div className="m" style={{ marginTop: '3px' }}>
                  {stop.time} • {stop.duration} • <span className="pill">{stop.category}</span>
                </div>
                {stop.transitToNext && (
                  <div className="m" style={{ marginTop: '6px', color: 'var(--acc)', fontWeight: '500' }}>
                    ↓ {stop.transitToNext}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Stop Modal Form */}
      {showAddStopModal && (
        <div className="pocketroute-modal-backdrop" onClick={() => setShowAddStopModal(false)}>
          <div className="pocketroute-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Add Stop to Itinerary</h3>
            <form onSubmit={handleAddStop} className="auth-form">
              <div className="form-group">
                <label className="form-label">Stop / Place Name</label>
                <input
                  className="auth-input"
                  placeholder="e.g. Hill Palace Museum"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Target Time</label>
                  <input
                    type="time"
                    className="auth-input"
                    value={newStopTime}
                    onChange={(e) => setNewStopTime(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Cost / Ticket (₹)</label>
                  <input
                    type="number"
                    className="auth-input"
                    placeholder="0"
                    value={newStopCost}
                    onChange={(e) => setNewStopCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="auth-input"
                  value={newStopCategory}
                  onChange={(e) => setNewStopCategory(e.target.value)}
                >
                  <option value="Sight">Sightseeing</option>
                  <option value="Food & Cafe">Food & Cafe</option>
                  <option value="Culture & Heritage">Culture & Heritage</option>
                  <option value="Transit & Ferry">Transit & Ferry</option>
                  <option value="Nature & Sunset">Nature & Sunset</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="nav-icon-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddStopModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal" style={{ flex: 1, marginTop: 0 }}>
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
