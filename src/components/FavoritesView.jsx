import React, { useState, useEffect } from 'react';

export default function FavoritesView({ user, onSelectTrip, onOpenShare, showToast }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/trips?userId=${user?.id || 'guest'}`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.trips.filter((t) => t.isFavorite));
      }
    } catch (err) {
      showToast('Error loading favorites from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (tripId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/favorite`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        setFavorites((prev) => prev.filter((t) => t._id !== tripId));
        showToast('Removed from favorites', 'info');
      }
    } catch (err) {
      showToast('Error removing favorite', 'error');
    }
  };

  return (
    <div className="favorites-container">
      <div className="plantrip-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--ink)' }}>⭐ My Favorites</h2>
          <p className="m" style={{ marginTop: '2px' }}>
            Your curated bucket-list travel routes and top favorited PocketRoute itineraries
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner-dot" style={{ borderColor: 'var(--acc)', borderTopColor: 'transparent', width: '24px', height: '24px' }}></span>
          <div className="m" style={{ marginTop: '10px' }}>Loading your favorite trips...</div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>⭐</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No favorites saved yet</h3>
          <p className="m" style={{ maxWidth: '420px', margin: '0 auto 18px' }}>
            Tap the star icon on any itinerary in "Plan the Trip" or "Re-Arrange" to save your best routes here for quick access.
          </p>
        </div>
      ) : (
        <div className="g2">
          {favorites.map((trip) => (
            <div key={trip._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="row">
                <b style={{ fontSize: '16px' }}>{trip.title}</b>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 0, fontSize: '18px', cursor: 'pointer' }}
                  onClick={() => handleRemoveFavorite(trip._id)}
                  title="Remove from favorites"
                >
                  ⭐
                </button>
              </div>

              <div className="m" style={{ margin: '6px 0 14px' }}>
                📍 {trip.destination} • {trip.days} days • Budget ₹{trip.budget?.toLocaleString('en-IN')}
                <br />
                {trip.stops?.length || 0} stops scheduled • {trip.trafficPace}
              </div>

              {/* Sample Stops Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                {trip.stops?.slice(0, 3).map((s) => (
                  <span key={s.id} className="pill">
                    {s.name.split(' (')[0]}
                  </span>
                ))}
                {trip.stops?.length > 3 && (
                  <span className="pill o">+{trip.stops.length - 3} more</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn-primary-teal"
                  style={{ flex: 1, padding: '8px 14px', fontSize: '13px', marginTop: 0 }}
                  onClick={() => onSelectTrip(trip)}
                >
                  Open Itinerary
                </button>
                <button
                  type="button"
                  className="nav-icon-btn"
                  onClick={() => {
                    onOpenShare({
                      type: 'trip',
                      title: trip.title,
                      subtitle: `${trip.destination} • ${trip.stops?.length || 0} stops`,
                      shareUrl: `http://localhost:3000/#/share/trip/${trip.shareCode}`,
                    });
                  }}
                  title="Share this trip with friends"
                >
                  🔗 Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
