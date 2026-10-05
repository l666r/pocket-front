import React, { useState } from 'react';

export default function FeedbackModal({ isOpen, onClose, user, showToast }) {
  const [category, setCategory] = useState('Feature Request');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please type your suggestion before sending', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim(),
          userName: user?.name || 'Explorer',
          userId: user?.id || 'guest',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');

      showToast('Thank you! Your suggestion was saved to PocketRoute database.', 'success');
      setMessage('');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pocketroute-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pocketroute-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
              Suggestions & Improvements
            </h3>
          </div>
          <button
            type="button"
            className="aab-close"
            style={{ fontSize: '20px', color: 'var(--mut)' }}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="m" style={{ marginBottom: '16px' }}>
          How can we make PocketRoute better for your journeys? We review all community ideas directly.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">How would you rate PocketRoute?</label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer', margin: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ color: star <= rating ? 'var(--or)' : 'var(--line)', transition: 'transform 0.15s' }}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Feedback Category</label>
            <select
              className="auth-input"
              style={{ padding: '9px 12px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Feature Request">Feature Request</option>
              <option value="UI & Design">UI & Design Experience</option>
              <option value="Route & Pricing Accuracy">Route & Pricing Accuracy</option>
              <option value="New City Request">Request a New City</option>
              <option value="Other">Other Suggestion</option>
            </select>
          </div>

          {/* Text Message */}
          <div className="form-group">
            <label className="form-label">Your Suggestion / Feedback</label>
            <textarea
              className="auth-input"
              rows={4}
              style={{ padding: '10px 12px', resize: 'vertical' }}
              placeholder="e.g. Add real-time ferry crowd alerts or live bus numbers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary-teal"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Send Suggestion'}
          </button>
        </form>
      </div>
    </div>
  );
}
