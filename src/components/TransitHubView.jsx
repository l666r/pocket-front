import React, { useState } from 'react';
import { getEntityImage } from '../visualAssets.js';

export default function TransitHubView({ currentCity = 'Kochi', cityData, showToast }) {
  const [selectedTransitId, setSelectedTransitId] = useState(null);

  const transitLines = cityData?.transit || [
    {
      id: 't1',
      name: `${currentCity} Water Metro Ferry Service`,
      type: 'Water Ferry',
      route: 'Terminal 1 ↔ Terminal 2 (Electric Boat)',
      frequency: 'Every 15 mins',
      fare: '₹20 / $2.50',
      scenicRating: 5,
      status: 'On Schedule',
    },
    {
      id: 't2',
      name: `${currentCity} Rapid Metro Rail`,
      type: 'Metro',
      route: 'North Station ↔ South Hub',
      frequency: 'Every 6 mins',
      fare: '₹30 / $3.00',
      scenicRating: 4.6,
      status: 'Active',
    },
  ];

  return (
    <div className="transit-hub-layout animate-fade-in">
      {/* Header Banner */}
      <div className="card-box transit-hero-box">
        <div className="thb-left">
          <div className="verified-pill">
            <span className="pulsing-green-dot"></span>
            <span>ECO-SMART MULTI-MODAL HUB</span>
          </div>
          <h2 className="thb-title">🚆 {currentCity} Smart Transit Network</h2>
          <p className="thb-desc">
            Real-time public transit schedules, water ferry frequencies, and eco-friendly route options for seamless urban navigation.
          </p>
        </div>

        <div className="thb-stats-grid">
          <div className="thb-stat-pill">
            <div className="tsp-num">⚡ 100%</div>
            <div className="tsp-label">Electric Powered</div>
          </div>
          <div className="thb-stat-pill">
            <div className="tsp-num">⏱️ 99.4%</div>
            <div className="tsp-label">On-Time Reliability</div>
          </div>
          <div className="thb-stat-pill">
            <div className="tsp-num">🌱 Zero</div>
            <div className="tsp-label">Water Emissions</div>
          </div>
        </div>
      </div>

      {/* Transit Lines Cards */}
      <div className="transit-lines-grid app-carousel-container">
        {transitLines.map((line, idx) => {
          const isSelected = selectedTransitId === line.id;
          const lineImg = getEntityImage(line, 'transit', idx);
          return (
            <div
              key={line.id}
              className={`card-box transit-line-card visual-transit-card ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setSelectedTransitId(line.id);
                showToast(`Viewing schedule details for ${line.name}`, 'info');
              }}
            >
              <div
                className="tlc-photo-wrap"
                style={{ backgroundImage: `url(${lineImg})` }}
              >
                <div className="tlc-header-overlay">
                  <div className="tlc-type-badge">
                    <span>{line.type.includes('Water') || line.type.includes('Ferry') ? '⛴️' : '🚆'}</span>
                    <span>{line.type}</span>
                  </div>
                  <div className="tlc-status-pill">{line.status}</div>
                </div>
              </div>

              <div className="tlc-body">
                <h3 className="tlc-name">{line.name}</h3>
                <p className="tlc-route">{line.route}</p>

              <div className="tlc-details-row">
                <div className="tlc-detail">
                  <span className="td-label">Frequency:</span>
                  <span className="td-val">⏰ {line.frequency}</span>
                </div>
                <div className="tlc-detail">
                  <span className="td-label">Standard Fare:</span>
                  <span className="td-val">🎟️ {line.fare}</span>
                </div>
                <div className="tlc-detail">
                  <span className="td-label">Scenic Score:</span>
                  <span className="td-val">⭐ {line.scenicRating} / 5</span>
                </div>
              </div>

                <div className="tlc-footer">
                  <span className="tlc-next">Next Departure: In 4 mins</span>
                  <button
                    type="button"
                    className="btn-subtle btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`Transit pass booked for ${line.name}!`, 'success');
                    }}
                  >
                    Book / QR Ticket ➔
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
