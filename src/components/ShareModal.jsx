import React, { useState } from 'react';

export default function ShareModal({ isOpen, onClose, shareData, showToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !shareData) return null;

  const { title, subtitle, shareUrl, type } = shareData;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check out this ${type === 'chat' ? 'chat conversation' : 'trip itinerary'} on PocketRoute: ${title}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="pocketroute-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pocketroute-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔗</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
              Share {type === 'chat' ? 'Conversation' : 'Trip Plan'}
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

        <p className="m" style={{ marginBottom: '16px', lineHeight: '1.5' }}>
          Anyone with this link will be able to view this {type === 'chat' ? 'AI conversation' : 'trip itinerary'}, just like in ChatGPT.
        </p>

        {/* Preview Card */}
        <div className="card" style={{ background: 'var(--bg)', padding: '14px', marginBottom: '18px' }}>
          <b style={{ fontSize: '15px', color: 'var(--ink)' }}>{title}</b>
          <div className="m" style={{ marginTop: '4px' }}>{subtitle || 'Created with PocketRoute Intelligent Travel'}</div>
        </div>

        {/* Link Copy Box */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            className="auth-input"
            style={{ padding: '9px 12px', fontSize: '13px', flex: 1 }}
            value={shareUrl}
            readOnly
          />
          <button
            type="button"
            className="btn-primary-teal"
            style={{ width: 'auto', padding: '9px 16px', whiteSpace: 'nowrap', marginTop: 0 }}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Social Share Options */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary-mint"
            style={{ flex: 1 }}
            onClick={handleWhatsApp}
          >
            <span>💬</span> Share to WhatsApp
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            style={{ padding: '8px 14px' }}
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            }}
          >
            Share to X
          </button>
        </div>
      </div>
    </div>
  );
}
