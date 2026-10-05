import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';

export default function SharedTripView({ shareCode, onOpenApp, showToast }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setError('Invalid share link: missing share code');
      setLoading(false);
      return;
    }

    const fetchSharedTrip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/trips/share/${shareCode}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Shared trip not found or expired');
        }
        setTrip(data.trip);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [shareCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="shared-trip-standalone-page">
        <div className="shared-trip-card loading-state">
          <div className="spinner-dot" style={{ width: '32px', height: '32px', borderColor: 'var(--acc)', borderTopColor: 'transparent' }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)' }}>Loading shared trip plan...</h3>
          <p className="m">Fetching verified itinerary from PocketRoute Cloud</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="shared-trip-standalone-page">
        <div className="shared-trip-card error-state">
          <span style={{ fontSize: '42px' }}>🗺️</span>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)' }}>Trip Plan Not Found</h2>
          <p className="m" style={{ maxWidth: '420px', margin: '8px 0 20px' }}>
            {error || 'This shared trip plan may have been deleted, cancelled, or the link is expired.'}
          </p>
          <button
            type="button"
            className="btn-primary-teal"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={onOpenApp}
          >
            Create a New Trip on PocketRoute
          </button>
        </div>
      </div>
    );
  }

  const adults = trip.adults || 2;
  const stops = trip.stops || [];
  const totalCost = stops.reduce((sum, s) => sum + (s.cost * adults), 0) + 1200;

  return (
    <div className="shared-trip-standalone-page">
      {/* Top Floating Navbar for Public Viewer */}
      <header className="shared-trip-header">
        <div className="shared-brand-col" onClick={onOpenApp}>
          <div className="brand-title">
            <span>Pocket</span><b>Route</b>
          </div>
          <span className="shared-badge-pill">Public Itinerary</span>
        </div>

        <div className="shared-header-actions">
          <button
            type="button"
            className="nav-icon-btn"
            onClick={handleCopyLink}
            title="Copy share link"
          >
            <span>{copied ? '✓' : '🔗'}</span>
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            className="nav-icon-btn hide-on-mobile"
            onClick={handlePrint}
            title="Print this itinerary"
          >
            <span>🖨️</span>
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn-primary-teal"
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', marginTop: 0 }}
            onClick={onOpenApp}
          >
            <span>🗺️</span> Open Full App
          </button>
        </div>
      </header>

      {/* Main Single Document Plan */}
      <main className="shared-trip-main-container">
        {/* Trip Hero Banner */}
        <div className="shared-hero-card">
          <div className="shared-hero-top">
            <span className="shared-destination-pill">📍 {trip.destination || 'Custom Route'}</span>
            <span className="shared-updated-text">
              Updated {new Date(trip.updatedAt || trip.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="shared-trip-title">{trip.title}</h1>

          {/* Quick Metrics Bar */}
          <div className="shared-metrics-grid">
            <div className="shared-metric-box">
              <span className="smb-label">Duration</span>
              <span className="smb-val">📅 {trip.days} Days</span>
            </div>

            <div className="shared-metric-box">
              <span className="smb-label">Group Size</span>
              <span className="smb-val">👥 {adults} Travelers</span>
            </div>

            <div className="shared-metric-box">
              <span className="smb-label">Target Budget</span>
              <span className="smb-val smb-accent">💰 ₹{trip.budget?.toLocaleString('en-IN')}</span>
            </div>

            <div className="shared-metric-box">
              <span className="smb-label">Est. Spend</span>
              <span className="smb-val">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Context Strip: Weather & Transit Pace */}
          <div className="shared-context-strip">
            {trip.weather && (
              <div className="shared-context-item">
                <span className="sci-icon">⛅</span>
                <span>{trip.weather}</span>
              </div>
            )}
            {trip.trafficPace && (
              <div className="shared-context-item">
                <span className="sci-icon">🚦</span>
                <span>{trip.trafficPace}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Timeline of Stops */}
        <div className="shared-timeline-section">
          <div className="shared-section-header">
            <h2 className="shared-section-title">
              Scheduled Stops & Timeline ({stops.length} stops)
            </h2>
            <span className="m" style={{ fontSize: '13px' }}>Optimized route order & transit intervals</span>
          </div>

          <div className="shared-stops-list">
            {stops.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                <p className="m">No stops added to this itinerary yet.</p>
              </div>
            ) : (
              stops.map((stop, idx) => (
                <div key={stop.id || idx} className="shared-stop-card-wrapper">
                  <div className="shared-stop-card">
                    <div className="shared-stop-num-badge">{idx + 1}</div>

                    <div className="shared-stop-body">
                      <div className="shared-stop-top-row">
                        <h3 className="shared-stop-name">{stop.name}</h3>
                        <span className="shared-stop-cost-pill">
                          {stop.cost ? `₹${stop.cost} pp` : 'Free'}
                        </span>
                      </div>

                      <div className="shared-stop-meta-row">
                        <span className="shared-time-pill">⏱️ {stop.time || 'Flexible'}</span>
                        <span className="shared-duration-pill">⏳ {stop.duration || '1h'}</span>
                        {stop.category && (
                          <span className="pill">{stop.category}</span>
                        )}
                        {stop.isLocked && (
                          <span className="pill amber" title="Locked reservation">🔒 Fixed Timing</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transit Connector to next stop */}
                  {stop.transitToNext && idx < stops.length - 1 && (
                    <div className="shared-transit-connector">
                      <div className="stc-line"></div>
                      <div className="stc-badge">
                        <span>↓</span>
                        <span>{stop.transitToNext}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Footer Card */}
        <div className="shared-summary-card">
          <div className="ssc-header">
            <h3>Budget & Optimization Summary</h3>
            <span className="ssc-status-tag">
              {trip.budget >= totalCost ? '✓ Within Budget' : '⚠️ Above Target'}
            </span>
          </div>

          <div className="ssc-stats-row">
            <div>
              <span className="m">Calculated Cost for {adults} Travelers</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink)' }}>
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="m">Target Budget</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--acc)' }}>
                ₹{trip.budget?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="shared-cta-box">
            <div>
              <b>Want to modify or customize this trip?</b>
              <p className="m" style={{ fontSize: '12.5px', marginTop: '2px' }}>
                Open in PocketRoute to re-arrange stops, auto-calculate transit schedules, or chat with AI.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary-teal"
              style={{ width: 'auto', padding: '10px 20px', whiteSpace: 'nowrap' }}
              onClick={onOpenApp}
            >
              Plan Your Trip on PocketRoute →
            </button>
          </div>
        </div>

        {/* Footer branding */}
        <footer className="shared-page-footer">
          <div className="brand-title" style={{ fontSize: '18px' }}>
            <span>Pocket</span><b>Route</b>
          </div>
          <p className="m" style={{ fontSize: '12px', marginTop: '4px' }}>
            Smart Location, Budget & Transit Intelligence • Designed for effortless travel
          </p>
        </footer>
      </main>
    </div>
  );
}
