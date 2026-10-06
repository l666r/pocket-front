import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';

export default function FavoritesView({ user, onSelectTrip, onOpenShare, showToast }) {
  const [favoriteTrips, setFavoriteTrips] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllFavorites = async () => {
    setLoading(true);
    try {
      const uid = user?.id || user?._id || 'guest';
      const res = await fetch(`${API_URL}/api/trips?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setFavoriteTrips(data.trips.filter((t) => t.isFavorite));
      }

      if (user?.favorites && user.favorites.length > 0) {
        setUserFavorites(user.favorites);
      }
    } catch (err) {
      showToast('Error loading favorites from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFavorites();
  }, [user]);

  const handleRemoveTripFavorite = async (tripId) => {
    try {
      const res = await fetch(`${API_URL}/api/trips/${tripId}/favorite`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        setFavoriteTrips((prev) => prev.filter((t) => t._id !== tripId));
        showToast('Removed from favorites', 'info');
      }
    } catch (err) {
      showToast('Error removing favorite', 'error');
    }
  };

  const handleRemoveItemFavorite = async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'guest', item }),
      });
      const data = await res.json();
      if (data.success) {
        setUserFavorites((prev) => prev.filter((f) => f.id !== item.id));
        showToast(`Removed "${item.title}" from saved items`, 'info');
      }
    } catch (err) {
      showToast('Error removing favorite', 'error');
    }
  };

  const totalFavorites = favoriteTrips.length + userFavorites.length;

  return (
    <div className="favorites-container animate-fade-in">
      {/* Header (Matching Reference Image 4) */}
      <div className="fav-page-header">
        <span className="section-eyebrow-green">YOUR COLLECTION</span>
        <h2 className="fav-page-title">Saved for later</h2>
        <p className="fav-page-sub">
          Return to past searches, favorite places, and itineraries that caught your eye.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner-dot" style={{ borderColor: 'var(--acc)', borderTopColor: 'transparent', width: '24px', height: '24px' }}></span>
          <div className="m" style={{ marginTop: '10px' }}>Loading your saved collection...</div>
        </div>
      ) : totalFavorites === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '20px' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🤍</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Your collection is empty</h3>
          <p className="m" style={{ maxWidth: '420px', margin: '0 auto 18px' }}>
            Tap the heart icon on any itinerary in "Plan the Trip", "Map Explorer", or the Dashboard to save your favorite routes and places here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 1: Saved Itineraries (Matching Reference Image 4 Block Cards) */}
          {favoriteTrips.length > 0 && (
            <div>
              <div className="fav-section-label-row">
                <span className="section-eyebrow-green">REUSE AN ITINERARY</span>
                <h3 className="fav-section-title">Saved AI Trips & Routes</h3>
              </div>

              <div className="fav-blocks-list">
                {favoriteTrips.map((trip) => (
                  <div key={trip._id} className="fav-item-block-card">
                    <div
                      className="fibc-main-row"
                      onClick={() => {
                        onSelectTrip && onSelectTrip(trip);
                        showToast(`Loaded "${trip.title}" into re-arranger`, 'info');
                      }}
                    >
                      <div className="fibc-icon-box">
                        <span>🔍</span>
                      </div>
                      <div className="fibc-info">
                        <div className="fibc-title">{trip.title}</div>
                        <div className="fibc-sub">
                          {trip.destination} • {trip.days} days • ₹{trip.budget?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="fibc-arrow">➔</div>
                    </div>

                    <div className="fibc-actions-strip">
                      <button
                        type="button"
                        className="fibc-action-btn"
                        onClick={() => handleRemoveTripFavorite(trip._id)}
                      >
                        <span>❤️ Saved</span>
                      </button>
                      <button
                        type="button"
                        className="fibc-action-btn"
                        onClick={() => {
                          onOpenShare && onOpenShare({
                            type: 'trip',
                            title: trip.title,
                            subtitle: `${trip.destination} • ${trip.stops?.length || 0} stops`,
                            shareUrl: `${window.location.origin}/#/share/trip/${trip.shareCode}`,
                          });
                        }}
                      >
                        <span>🔗 Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Saved Places & Waypoints (Matching Reference Image 4) */}
          {userFavorites.length > 0 && (
            <div>
              <div className="fav-section-label-row">
                <span className="section-eyebrow-green">SAVED PLACES</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="fav-section-title">Your Travel Shortlist</h3>
                  <span style={{ fontSize: '18px' }}>🗺️</span>
                </div>
              </div>

              <div className="fav-blocks-list">
                {userFavorites.map((item) => (
                  <div key={item.id} className="fav-item-block-card">
                    <div className="fibc-main-row">
                      <div className="fibc-icon-box tint-emerald">
                        <span>📍</span>
                      </div>
                      <div className="fibc-info">
                        <div className="fibc-title">{item.title}</div>
                        <div className="fibc-sub">
                          {item.itemType ? `Type: ${item.itemType.toUpperCase()}` : 'Waypoint'} • {item.city || 'Global'}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 0, fontSize: '18px', cursor: 'pointer' }}
                        onClick={() => handleRemoveItemFavorite(item)}
                        title="Remove from shortlist"
                      >
                        ❤️
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
