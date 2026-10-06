import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import { getEntityImage } from '../visualAssets.js';

export default function ContributePlacesView({ user, showToast }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sight');
  const [area, setArea] = useState('Fort Kochi');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [bestTime, setBestTime] = useState('Evening (5:00 PM – 7:00 PM)');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/api/places`);
      if (selectedArea !== 'All') url.searchParams.append('area', selectedArea);
      if (selectedCategory !== 'All') url.searchParams.append('category', selectedCategory);

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPlaces(data.places);
      }
    } catch (err) {
      showToast('Error loading places from MongoDB Atlas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, [selectedArea, selectedCategory]);

  const handleUpvote = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/places/${id}/upvote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setPlaces((prev) =>
          prev.map((p) => (p._id === id ? { ...p, upvotes: data.upvotes } : p))
        );
        showToast('Upvoted! Thank you for supporting community places.', 'success');
      }
    } catch (err) {
      showToast('Error upvoting place', 'error');
    }
  };

  const handleRatePlace = async (id, rating) => {
    try {
      const res = await fetch(`${API_URL}/api/places/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userName: user?.name || 'Explorer' }),
      });
      const data = await res.json();
      if (data.success) {
        setPlaces((prev) =>
          prev.map((p) => (p._id === id ? { ...p, rating: data.rating, ratingCount: data.ratingCount } : p))
        );
        showToast(`Rated ${rating} stars! Thank you for reviewing.`, 'success');
      }
    } catch (err) {
      showToast('Error saving rating', 'error');
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!name.trim() || !area.trim() || !description.trim()) {
      showToast('Please fill in place name, area, and description', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          area: area.trim(),
          address: address.trim(),
          imageUrl: imageUrl.trim(),
          entryFee: Number(entryFee) || 0,
          bestTime,
          description: description.trim(),
          contributedBy: user?.name || 'Local Community Explorer',
          rating: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit place');

      showToast(`Added "${name}" to community places!`, 'success');
      setName('');
      setAddress('');
      setImageUrl('');
      setEntryFee('');
      setDescription('');
      setShowAddModal(false);
      loadPlaces();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contribute-places-container">
      {/* Header */}
      <div className="plantrip-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--ink)' }}>📍 Contribute Places</h2>
          <p className="m" style={{ marginTop: '2px' }}>
            Crowd-source hidden gems, local cafes, and scenic stops directly into PocketRoute (Google Maps style)
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-teal"
          style={{ width: 'auto', padding: '8px 18px', marginTop: 0 }}
          onClick={() => setShowAddModal(true)}
        >
          + Add New Place
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <select
          className="f"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          <option value="All">All Areas</option>
          <option value="Fort Kochi">Fort Kochi</option>
          <option value="Ernakulam">Ernakulam</option>
          <option value="Marine Drive">Marine Drive</option>
          <option value="Kakkanad">Kakkanad</option>
        </select>

        <select
          className="f"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Sight">Sightseeing</option>
          <option value="Food & Cafe">Food & Cafe</option>
          <option value="Culture & Heritage">Culture & Heritage</option>
          <option value="Transit & Ferry">Transit & Ferry</option>
          <option value="Nature & Sunset">Nature & Sunset</option>
          <option value="Hidden Gem">Hidden Gem</option>
        </select>
      </div>

      {/* Places Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner-dot" style={{ borderColor: 'var(--acc)', borderTopColor: 'transparent', width: '24px', height: '24px' }}></span>
          <div className="m" style={{ marginTop: '10px' }}>Loading contributed places...</div>
        </div>
      ) : places.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🗺️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No places in this category yet</h3>
          <p className="m" style={{ maxWidth: '420px', margin: '0 auto 18px' }}>
            Be the first to add a secret spot or local favorite in this area!
          </p>
          <button
            type="button"
            className="btn-primary-teal"
            style={{ width: 'auto', margin: '0 auto' }}
            onClick={() => setShowAddModal(true)}
          >
            + Add First Place
          </button>
        </div>
      ) : (
        <div className="g3">
          {places.map((place, idx) => {
            const photoUrl = place.imageUrl || getEntityImage(place, 'cafes', idx);
            return (
              <div key={place._id} className="card place-community-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="pcc-img-wrap" style={{ height: '140px', overflow: 'hidden', borderRadius: '8px', marginBottom: '10px' }}>
                  <img
                    src={photoUrl}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              <div className="row">
                <b style={{ fontSize: '15px' }}>{place.name}</b>
                <span className="pill">{place.category}</span>
              </div>

              <div className="m" style={{ margin: '4px 0 8px' }}>
                📍 {place.area}{place.address ? ` • ${place.address}` : ''}
                <br />
                {place.entryFee === 0 ? 'Free entry' : `₹${place.entryFee} entry fee`} • {place.bestTime}
              </div>

              {/* Star Rating Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: star <= Math.round(place.rating || 5) ? '#E5A93C' : 'var(--faint)',
                    }}
                    onClick={() => handleRatePlace(place._id, star)}
                    title={`Rate this place ${star} stars`}
                  >
                    ★
                  </span>
                ))}
                <span className="m" style={{ fontSize: '12px', marginLeft: '4px' }}>
                  ({place.rating || 4.8} / 5 • {place.ratingCount || 1} reviews)
                </span>
              </div>

              <p className="m" style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--ink)', flex: 1, marginBottom: '14px' }}>
                {place.description}
              </p>

              <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: 'auto' }}>
                <span className="m" style={{ fontSize: '11.5px' }}>
                  By {place.contributedBy}
                </span>
                <button
                  type="button"
                  className="nav-icon-btn"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => handleUpvote(place._id)}
                  title="Upvote this community recommendation"
                >
                  👍 {place.upvotes || 1}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Add Place Modal Dialog */}
      {showAddModal && (
        <div className="pocketroute-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="pocketroute-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>Contribute a Place</h3>
              </div>
              <button
                type="button"
                className="aab-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <p className="m" style={{ marginBottom: '16px' }}>
              Share local viewpoints, ferry stops, heritage sites, or food stalls with fellow PocketRoute travelers.
            </p>

            <form onSubmit={handleAddPlace} className="auth-form">
              <div className="form-group">
                <label className="form-label">Place Name <span className="req-star">*</span></label>
                <input
                  className="auth-input"
                  placeholder="e.g. Seagull Waterfront Deck or Bolgatty Palace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="auth-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Sight">Sightseeing</option>
                    <option value="Food & Cafe">Food & Cafe</option>
                    <option value="Culture & Heritage">Culture & Heritage</option>
                    <option value="Transit & Ferry">Transit & Ferry</option>
                    <option value="Nature & Sunset">Nature & Sunset</option>
                    <option value="Hidden Gem">Hidden Gem</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Area / Region <span className="req-star">*</span></label>
                  <input
                    className="auth-input"
                    placeholder="e.g. Fort Kochi"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street / Landmark Address</label>
                <input
                  className="auth-input"
                  placeholder="e.g. Calvathy Road, Near Customs Jetty"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Photo Image URL (Optional)</label>
                <input
                  className="auth-input"
                  placeholder="https://images.unsplash.com/... or web image link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Entry Fee / Min Cost (₹)</label>
                  <input
                    type="number"
                    className="auth-input"
                    placeholder="0 if free"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Best Time to Visit</label>
                  <input
                    className="auth-input"
                    placeholder="e.g. Sunset (5:30 PM - 7:00 PM)"
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Tips <span className="req-star">*</span></label>
                <textarea
                  className="auth-input"
                  rows={3}
                  placeholder="What makes this place special? Any parking, photography or ticket advice?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="nav-icon-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-teal"
                  style={{ flex: 1, marginTop: 0 }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
