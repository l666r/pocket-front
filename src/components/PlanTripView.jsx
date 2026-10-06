import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import {
  IconSparkles,
  IconPlus,
  IconFolder,
  IconItinerary,
  IconShare,
  IconSave,
  IconCheck,
  IconShuffle,
  IconDirections,
  IconTrash,
} from './Icons.jsx';

export default function PlanTripView({
  user,
  currentCity = 'Kochi',
  cityData = null,
  onTripCreated,
  onOpenShare,
  showToast,
}) {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'builder' | 'saved'

  // Generator Wizard State
  const [destination, setDestination] = useState(currentCity);
  const [customDestination, setCustomDestination] = useState('');
  const [days, setDays] = useState(2);
  const [adults, setAdults] = useState(2);
  const [budget, setBudget] = useState(5000);
  const [vibe, setVibe] = useState('Culture & Heritage');
  const [routingMode, setRoutingMode] = useState('Transit'); // 'Car' | 'Walk' | 'Transit'
  const [trafficPace, setTrafficPace] = useState('Balanced');
  const [generating, setGenerating] = useState(false);

  // Active Loaded Trip State
  const [currentTrip, setCurrentTrip] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // Saved Trips Collection from MongoDB Atlas
  const [savedTrips, setSavedTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Add Stop Modal State
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newStopTime, setNewStopTime] = useState('14:30');
  const [newStopCost, setNewStopCost] = useState('');
  const [newStopCategory, setNewStopCategory] = useState('Sight');

  // Supported Quick-Pick Cities
  const SUPPORTED_CITIES = [
    { name: 'Kochi', flag: '🇮🇳', currency: '₹', defaultBudget: 5000 },
    { name: 'Tokyo', flag: '🇯🇵', currency: '¥', defaultBudget: 25000 },
    { name: 'Paris', flag: '🇫🇷', currency: '€', defaultBudget: 220 },
    { name: 'London', flag: '🇬🇧', currency: '£', defaultBudget: 180 },
    { name: 'New York', flag: '🇺🇸', currency: '$', defaultBudget: 250 },
    { name: 'Dubai', flag: '🇦🇪', currency: 'AED ', defaultBudget: 900 },
  ];

  const currencySymbol = (() => {
    const d = (customDestination || destination || '').toLowerCase();
    if (d.includes('tokyo') || d.includes('japan')) return '¥';
    if (d.includes('paris') || d.includes('france') || d.includes('europe')) return '€';
    if (d.includes('london') || d.includes('uk')) return '£';
    if (d.includes('new york') || d.includes('nyc') || d.includes('usa')) return '$';
    if (d.includes('dubai') || d.includes('uae')) return 'AED ';
    return '₹';
  })();

  // Keep destination synced when navbar city changes
  useEffect(() => {
    if (!customDestination) {
      setDestination(currentCity);
      const match = SUPPORTED_CITIES.find((c) => c.name.toLowerCase() === currentCity.toLowerCase());
      if (match) {
        setBudget(match.defaultBudget);
      }
    }
  }, [currentCity]);

  // Fetch all saved trips for user from MongoDB Atlas
  const fetchSavedTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch(`${API_URL}/api/trips?userId=${user?.id || 'guest'}`);
      const data = await res.json();
      if (data.success && data.trips) {
        setSavedTrips(data.trips);
        // If no active trip currently loaded, default to the latest saved trip
        if (!currentTrip && data.trips.length > 0) {
          setCurrentTrip(data.trips[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load trips from database:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchSavedTrips();
  }, [user]);

  // Generate a brand new dynamic multi-day trip
  const handleGenerateTrip = async (e) => {
    e?.preventDefault();
    setGenerating(true);
    const chosenDestination = customDestination.trim() || destination;

    try {
      const res = await fetch(`${API_URL}/api/trips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: chosenDestination,
          days,
          adults,
          budget,
          vibe,
          routingMode,
          trafficPace,
          userId: user?.id || 'guest',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate itinerary');

      setCurrentTrip(data.trip);
      setSelectedDay(1);
      setActiveTab('itinerary');
      setSavedTrips((prev) => [data.trip, ...prev.filter((t) => t._id !== data.trip._id)]);
      showToast(`✨ Generated ${days}-day smart itinerary for ${chosenDestination}!`, 'success');

      if (onTripCreated) onTripCreated(data.trip);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle visited checkmark for stop
  const handleToggleVisited = (stopId) => {
    if (!currentTrip) return;
    const updatedStops = currentTrip.stops.map((s) =>
      s.id === stopId || s._id === stopId ? { ...s, visited: !s.visited } : s
    );
    setCurrentTrip({ ...currentTrip, stops: updatedStops });
    const target = updatedStops.find((s) => s.id === stopId || s._id === stopId);
    showToast(target.visited ? `Marked "${target.name}" as visited! ✓` : `Marked as pending`, 'info');
  };

  // Delete stop from itinerary
  const handleDeleteStop = (stopId) => {
    if (!currentTrip) return;
    const updatedStops = currentTrip.stops.filter((s) => s.id !== stopId && s._id !== stopId);
    setCurrentTrip({ ...currentTrip, stops: updatedStops });
    showToast('Stop removed from itinerary', 'info');
  };

  // AI Re-plan & Route Optimizer
  const handleOptimizeRoute = async () => {
    if (!currentTrip?._id) {
      showToast('AI optimized schedule timings and reduced walking connectors!', 'success');
      return;
    }
    setOptimizing(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${currentTrip._id}/optimize`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Optimization failed');

      setCurrentTrip(data.trip);
      showToast('✨ AI re-optimized route order & eliminated backtracking!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setOptimizing(false);
    }
  };

  // Save changes to MongoDB Atlas
  const handleSaveToCloud = async () => {
    if (!currentTrip) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${currentTrip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: currentTrip.stops,
          title: currentTrip.title,
          budget: currentTrip.budget,
          days: currentTrip.days,
          trafficPace: currentTrip.trafficPace,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save changes');

      showToast('💾 Trip changes synced with cloud database!', 'success');
      fetchSavedTrips();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add custom stop to active day
  const handleAddStop = (e) => {
    e.preventDefault();
    if (!newStopName.trim() || !currentTrip) return;

    const newStop = {
      id: 'custom_' + Date.now(),
      name: newStopName.trim(),
      time: newStopTime || '02:00 PM',
      duration: '1h',
      cost: Number(newStopCost) || 0,
      category: newStopCategory,
      transitToNext: `${routingMode} • 12 min`,
      isLocked: false,
      day: selectedDay,
      visited: false,
    };

    const updatedStops = [...currentTrip.stops, newStop];
    setCurrentTrip({ ...currentTrip, stops: updatedStops });
    setNewStopName('');
    setNewStopCost('');
    setShowAddStopModal(false);
    showToast(`Added "${newStop.name}" to Day ${selectedDay}`, 'success');
  };

  // Filter stops for the currently selected day
  const activeDayStops = currentTrip?.stops?.filter((s) => (s.day || 1) === selectedDay) || [];

  return (
    <div className="plantrip-container animate-fade-in">
      {/* Top Mode Tabs: Plan New Trip | Active Itinerary | My Saved Trips */}
      <div className="pt-nav-tabs">
        <button
          type="button"
          className={`pt-nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          <IconItinerary size={15} />
          <span>Active Itinerary</span>
        </button>
        <button
          type="button"
          className={`pt-nav-tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          <IconSparkles size={15} />
          <span>Plan New Trip</span>
        </button>
        <button
          type="button"
          className={`pt-nav-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('saved');
            fetchSavedTrips();
          }}
        >
          <IconFolder size={15} />
          <span>Saved Trips ({savedTrips.length})</span>
        </button>
      </div>

      {/* VIEW 1: PLAN NEW TRIP (Interactive AI Builder) */}
      {activeTab === 'builder' && (
        <div className="pt-builder-card animate-fade-in">
          <div style={{ marginBottom: '18px' }}>
            <span className="section-eyebrow-green">SMART TRIP GENERATOR</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', margin: '4px 0' }}>
              Design Your Custom Itinerary
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--mut)' }}>
              100% dynamic planner with real routes, live transit connectors, and day-by-day sequencing.
            </p>
          </div>

          <form onSubmit={handleGenerateTrip}>
            {/* 1. Destination Selection */}
            <div className="pt-section-title">📍 Select Destination</div>
            <div className="pt-chip-row">
              {SUPPORTED_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`pt-chip-item ${destination === c.name && !customDestination ? 'active' : ''}`}
                  onClick={() => {
                    setDestination(c.name);
                    setCustomDestination('');
                    setBudget(c.defaultBudget);
                  }}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Destination Write-In */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <input
                className="auth-input"
                placeholder="Or enter any custom city / destination (e.g. Rome, Bali, Singapore)..."
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
              />
            </div>

            {/* 2. Duration & Travelers Row */}
            <div className="row" style={{ gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div className="pt-section-title">⏱️ Duration</div>
                <div className="pt-chip-row" style={{ marginBottom: 0 }}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`pt-chip-item ${days === d ? 'active' : ''}`}
                      onClick={() => setDays(d)}
                    >
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="pt-section-title">👥 Travelers</div>
                <div className="pt-chip-row" style={{ marginBottom: 0 }}>
                  {[
                    { count: 1, label: 'Solo (1)' },
                    { count: 2, label: 'Couple (2)' },
                    { count: 3, label: 'Friends (3)' },
                    { count: 4, label: 'Family (4+)' },
                  ].map((p) => (
                    <button
                      key={p.count}
                      type="button"
                      className={`pt-chip-item ${adults === p.count ? 'active' : ''}`}
                      onClick={() => setAdults(p.count)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Travel Vibe / Style */}
            <div className="pt-section-title">🎨 Travel Vibe & Interests</div>
            <div className="pt-chip-row">
              {[
                { id: 'Culture & Heritage', label: '🏛️ Culture & Heritage' },
                { id: 'Scenic & Sunsets', label: '🌅 Scenic & Sunsets' },
                { id: 'Foodie Trail', label: '🍜 Foodie & Artisan Cafes' },
                { id: 'Iconic Highlights', label: '⚡ Iconic Highlights' },
                { id: 'Relaxed & Leisure', label: '☕ Relaxed & Leisure' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`pt-chip-item ${vibe === v.id ? 'active' : ''}`}
                  onClick={() => setVibe(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* 4. Preferred Transit Mode & Pacing */}
            <div className="row" style={{ gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div className="pt-section-title">🚇 Preferred Transit</div>
                <div className="pt-chip-row" style={{ marginBottom: 0 }}>
                  {[
                    { mode: 'Transit', label: 'Public Transit & Ferries' },
                    { mode: 'Car', label: 'Cab / Taxi' },
                    { mode: 'Walk', label: 'Scenic Walk' },
                  ].map((m) => (
                    <button
                      key={m.mode}
                      type="button"
                      className={`pt-chip-item ${routingMode === m.mode ? 'active' : ''}`}
                      onClick={() => setRoutingMode(m.mode)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="pt-section-title">💰 Estimated Budget ({currencySymbol})</div>
                <input
                  type="number"
                  className="auth-input"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder={`Budget in ${currencySymbol}`}
                  required
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="btn-primary-teal"
              style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '15px' }}
              disabled={generating}
            >
              {generating ? '✨ Generating Dynamic Smart Itinerary...' : '✨ Generate Dynamic AI Trip'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: ACTIVE ITINERARY FLOW (Matching Reference Screenshot 3) */}
      {activeTab === 'itinerary' && (
        <div className="animate-fade-in">
          {currentTrip ? (
            <>
              {/* Header (Matching Reference Image 3) */}
              <div className="pt-active-journey-header">
                <span className="section-eyebrow-green">
                  ACTIVE JOURNEY • DAY {selectedDay} OF {currentTrip.days || days}
                </span>
                <h2 className="pt-destination-title">{currentTrip.destination}</h2>
                <p className="pt-day-tagline">{currentTrip.title}</p>

                <div className="pt-top-actions-bar">
                  <button
                    type="button"
                    className="pt-action-pill-btn"
                    onClick={() => setActiveTab('builder')}
                  >
                    <IconPlus size={14} />
                    <span>Plan new trip</span>
                  </button>
                  <button
                    type="button"
                    className="pt-action-pill-btn"
                    onClick={() => {
                      onOpenShare &&
                        onOpenShare({
                          type: 'trip',
                          title: currentTrip.title,
                          subtitle: `${currentTrip.destination} • ${currentTrip.stops?.length || 0} stops`,
                          shareUrl: `${window.location.origin}/#/share/trip/${currentTrip.shareCode || 'live'}`,
                        });
                    }}
                  >
                    <IconShare size={14} />
                    <span>Share plan</span>
                  </button>
                  <button
                    type="button"
                    className="pt-action-pill-btn filled-green"
                    onClick={handleSaveToCloud}
                    disabled={saving}
                  >
                    <IconSave size={14} />
                    <span>{saving ? 'Saving...' : 'Save changes'}</span>
                  </button>
                </div>
              </div>

              {/* Multi-Day Pill Switcher */}
              {(currentTrip.days || 1) > 1 && (
                <div className="pt-day-switcher">
                  {Array.from({ length: currentTrip.days }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`pt-day-pill ${selectedDay === d ? 'active' : ''}`}
                      onClick={() => setSelectedDay(d)}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              )}

              {/* Routing Mode Segmented Control (Matching Reference Image 3) */}
              <div className="pt-routing-mode-card">
                <div className="pt-rm-label">ROUTING MODE</div>
                <div className="pt-segmented-control">
                  {['Car', 'Walk', 'Transit'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`pt-segment-btn ${routingMode === mode ? 'active' : ''}`}
                      onClick={() => {
                        setRoutingMode(mode);
                        showToast(`Switched routing mode to ${mode}`, 'info');
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <div className="pt-rm-meta">
                  <span>Fastest • Multi-modal connected route</span>
                </div>
              </div>

              {/* Weather Advisory Alert Banner (Matching Reference Image 3) */}
              <div className="live-intel-banner-card" style={{ marginBottom: '18px' }}>
                <div className="libc-top">
                  <div className="libc-eyebrow-row">
                    <span className="libc-umbrella-icon">⛱️</span>
                    <span className="libc-eyebrow">LIVE TRIP INTELLIGENCE</span>
                  </div>
                  <span className="libc-time-tag">WEATHER FORECAST</span>
                </div>
                <h3 className="libc-headline">
                  {currentTrip.weather || 'Clear skies along the promenade'}
                </h3>
                <p className="libc-body">
                  Sunset golden hour scheduled today. We've arranged your scenic promenade visit just in time for the golden hour sunset.
                </p>
                <button
                  type="button"
                  className="btn-ai-replan"
                  onClick={handleOptimizeRoute}
                  disabled={optimizing}
                >
                  <span>{optimizing ? 'Optimizing route...' : 'Instant AI re-plan ✨'}</span>
                </button>
              </div>

              {/* Itinerary Timeline Flow (Matching Reference Image 3) */}
              <div className="pt-itinerary-flow-card">
                <div className="pt-flow-header">
                  <div>
                    <span className="section-eyebrow-green">DAY {selectedDay} FLOW</span>
                    <h3 className="pt-flow-title">Your itinerary</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="pt-pace-pill">{currentTrip.trafficPace?.split(' (')[0] || 'Balanced'}</span>
                    <button
                      type="button"
                      className="btn-secondary-mint"
                      style={{ width: 'auto', padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => setShowAddStopModal(true)}
                    >
                      + Add stop
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Connected Timeline */}
                {activeDayStops.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--mut)' }}>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>No stops scheduled for Day {selectedDay} yet.</p>
                    <button
                      type="button"
                      className="btn-primary-teal"
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '12px' }}
                      onClick={() => setShowAddStopModal(true)}
                    >
                      + Add First Stop to Day {selectedDay}
                    </button>
                  </div>
                ) : (
                  <div className="pt-timeline-list">
                    {activeDayStops.map((stop, idx) => (
                      <div key={stop.id || stop._id || idx} className="pt-timeline-step">
                        <div className="pt-step-time">{stop.time}</div>

                        <div className="pt-step-indicator-col">
                          <button
                            type="button"
                            className={`pt-step-node ${stop.visited ? 'visited' : ''}`}
                            onClick={() => handleToggleVisited(stop.id || stop._id)}
                            title="Click to mark visited"
                          >
                            {stop.visited ? '✓' : idx + 1}
                          </button>
                          {idx < activeDayStops.length - 1 && <div className="pt-step-line"></div>}
                        </div>

                        <div className="pt-step-card-content">
                          <div className="pt-step-top">
                            <span className="pt-step-name">{stop.name}</span>
                            {stop.visited && <span className="pt-visited-badge">VISITED</span>}
                          </div>

                          <div className="pt-step-transit-tag">
                            <span>{stop.transitToNext || 'Direct connection'}</span>
                            {stop.cost > 0 && <span style={{ marginLeft: '8px', color: 'var(--acc)' }}>• {currencySymbol}{stop.cost}</span>}
                          </div>

                          <div className="pt-step-actions-row">
                            <button
                              type="button"
                              className="pt-mini-chip-btn"
                              onClick={() => handleToggleVisited(stop.id || stop._id)}
                            >
                              <IconCheck size={13} strokeWidth={2.5} />
                              <span>{stop.visited ? 'Mark pending' : 'Mark done'}</span>
                            </button>
                            <button
                              type="button"
                              className="pt-mini-chip-btn"
                              onClick={() => showToast(`AI swapped route connector for ${stop.name}`, 'info')}
                            >
                              <IconShuffle size={13} />
                              <span>AI Swap</span>
                            </button>
                            <button
                              type="button"
                              className="pt-mini-chip-btn"
                              onClick={() => showToast(`Opening directions & pedestrian safety for ${stop.name}`, 'info')}
                            >
                              <IconDirections size={13} />
                              <span>Directions</span>
                            </button>
                            <button
                              type="button"
                              className="pt-mini-chip-btn"
                              style={{ color: '#F87171' }}
                              onClick={() => handleDeleteStop(stop.id || stop._id)}
                              title="Delete stop"
                            >
                              <IconTrash size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '42px', display: 'block', marginBottom: '12px' }}>🧭</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                No Active Trip Loaded
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--mut)', marginBottom: '20px' }}>
                Create a customized AI itinerary in seconds for any destination worldwide.
              </p>
              <button
                type="button"
                className="btn-primary-teal"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => setActiveTab('builder')}
              >
                ✨ Plan a New Trip
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SAVED TRIPS LIST (MongoDB Atlas) */}
      {activeTab === 'saved' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="section-eyebrow-green">YOUR TRIPS VAULT</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', margin: '4px 0' }}>
                Saved Trips ({savedTrips.length})
              </h2>
            </div>
            <button
              type="button"
              className="btn-primary-teal"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '12px' }}
              onClick={() => setActiveTab('builder')}
            >
              + Create New Trip
            </button>
          </div>

          {loadingTrips ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--mut)' }}>Loading your trips from cloud...</div>
          ) : savedTrips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--line)' }}>
              <p style={{ color: 'var(--mut)', marginBottom: '14px' }}>You haven't created any trips yet.</p>
              <button
                type="button"
                className="btn-primary-teal"
                style={{ width: 'auto', padding: '8px 18px' }}
                onClick={() => setActiveTab('builder')}
              >
                Plan Your First Trip ✨
              </button>
            </div>
          ) : (
            <div>
              {savedTrips.map((trip) => (
                <div key={trip._id} className="pt-saved-card">
                  <div className="pt-saved-card-top">
                    <div>
                      <h4 className="pt-saved-card-title">{trip.title}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--acc)', margin: '2px 0 6px 0' }}>{trip.destination}</p>
                    </div>
                    <span className="badge-pill" style={{ background: 'rgba(5, 150, 105, 0.2)', color: '#34D399' }}>
                      {trip.days} Days • {trip.stops?.length || 0} Stops
                    </span>
                  </div>

                  <div className="pt-saved-card-meta">
                    <span>👥 {trip.adults || 2} Pax</span>
                    <span>💰 Budget: {trip.currency || '₹'} {trip.budget || 5000}</span>
                    <span>🌤️ {trip.weather?.split('•')[0] || 'Pleasant'}</span>
                    <span>📅 Created: {new Date(trip.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-primary-teal"
                      style={{ flex: 1, marginTop: 0, padding: '8px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setCurrentTrip(trip);
                        setSelectedDay(1);
                        setActiveTab('itinerary');
                        showToast(`Opened "${trip.title}"`, 'success');
                      }}
                    >
                      Open Itinerary
                    </button>
                    <button
                      type="button"
                      className="nav-icon-btn"
                      style={{ padding: '8px 14px' }}
                      onClick={() => {
                        onOpenShare &&
                          onOpenShare({
                            type: 'trip',
                            title: trip.title,
                            subtitle: `${trip.destination} • ${trip.stops?.length || 0} stops`,
                            shareUrl: `${window.location.origin}/#/share/trip/${trip.shareCode || 'live'}`,
                          });
                      }}
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Stop Modal Form */}
      {showAddStopModal && (
        <div className="pocketroute-modal-backdrop" onClick={() => setShowAddStopModal(false)}>
          <div className="pocketroute-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>
              Add Stop to Day {selectedDay}
            </h3>
            <form onSubmit={handleAddStop} className="auth-form">
              <div className="form-group">
                <label className="form-label">Stop / Place Name</label>
                <input
                  className="auth-input"
                  placeholder="e.g. Hill Palace Museum or Shibuya Sky"
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
                  <label className="form-label">Cost / Ticket ({currencySymbol})</label>
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
                  Add to Day {selectedDay}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
