import React, { useState } from 'react';
import { getEntityImage } from '../visualAssets.js';

export default function EventsView({ currentCity = 'Kochi', cityData, onAddToTrip, showToast }) {
  const [filterCat, setFilterCat] = useState('All');

  const events = cityData?.events || [
    {
      id: 'e1',
      title: `${currentCity} Cultural Biennale & Modern Art`,
      date: 'Daily Exhibition (10:00 AM – 6:00 PM)',
      location: 'Waterfront Pavilion',
      category: 'Art & Culture',
      price: '₹150 / $10',
    },
    {
      id: 'e2',
      title: 'Traditional Evening Dance & Makeup Recital',
      date: 'Every Evening at 6:30 PM',
      location: 'Heritage Cultural Center',
      category: 'Heritage Dance',
      price: '₹400 / $15',
    },
    {
      id: 'e3',
      title: 'Waterfront Acoustic Indie Music Sessions',
      date: 'This Weekend (7:00 PM – 10:00 PM)',
      location: 'Promenade Seaside Garden',
      category: 'Live Music',
      price: 'Free Entry',
    },
  ];

  const categories = ['All', 'Art & Culture', 'Heritage Dance', 'Live Music'];

  const filteredEvents = events.filter((ev) => filterCat === 'All' || ev.category === filterCat);

  return (
    <div className="events-view-layout animate-fade-in">
      <div className="card-box events-hero-box">
        <div className="ehb-left">
          <div className="verified-pill">
            <span className="pulsing-green-dot"></span>
            <span>WHAT'S HAPPENING NOW</span>
          </div>
          <h2 className="ehb-title">🎭 {currentCity} Events & Cultural Calendar</h2>
          <p className="ehb-desc">
            Discover verified cultural exhibitions, live concerts, classical recitals, and regional festivals happening in {currentCity}.
          </p>
        </div>

        <div className="events-cat-pills">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`cat-pill-btn ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="events-card-grid app-carousel-container">
        {filteredEvents.map((ev, idx) => {
          const evImg = getEntityImage(ev, 'events', idx);
          return (
            <div key={ev.id} className="card-box event-card visual-event-card">
              <div
                className="ec-photo-wrap"
                style={{ backgroundImage: `url(${evImg})` }}
              >
                <div className="ec-badges-float">
                  <span className="ec-badge">{ev.category}</span>
                  <span className="ec-price">{ev.price}</span>
                </div>
              </div>

              <div className="ec-body">
                <h3 className="ec-title">{ev.title}</h3>

                <div className="ec-meta-list">
                  <div className="ec-meta-item">
                    <span>📅</span>
                    <span>{ev.date}</span>
                  </div>
                  <div className="ec-meta-item">
                    <span>📍</span>
                    <span>{ev.location}</span>
                  </div>
                </div>

                <div className="ec-footer">
                  <button
                    type="button"
                    className="btn-prime btn-sm"
                    onClick={() => {
                      onAddToTrip && onAddToTrip({ name: ev.title, cost: 0, category: 'Culture' });
                      showToast(`Added "${ev.title}" to trip itinerary!`, 'success');
                    }}
                  >
                    <span>➕ Add to Itinerary</span>
                  </button>
                  <button
                    type="button"
                    className="btn-subtle btn-sm"
                    onClick={() => showToast(`Event pass details saved for ${ev.title}`, 'info')}
                  >
                    <span>🎟️ Pass Info</span>
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
