import React, { useState } from 'react';
import { VISUAL_IMAGES, getEntityImage } from '../visualAssets.js';

export default function DashboardView({
  user,
  currentCity = 'Kochi',
  cityData,
  userLikes = ['movies', 'travel', 'cafes', 'transit', 'heritage', 'events', 'sunsets'],
  onNavigate,
  onLogout,
  onAddToTrip,
  onToggleFavorite,
  favorites = [],
  showToast,
}) {
  const [ratedItems, setRatedItems] = useState({});

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'B';
  const weather = cityData?.weather || { temp: '29°C', condition: 'Sunny & pleasant breeze', sunsetTime: '6:18 PM' };
  const currencySymbol = cityData?.currencySymbol || '₹';
  const heroImage = cityData?.heroImage || VISUAL_IMAGES.cities[currentCity] || VISUAL_IMAGES.cities.Kochi;

  const handleRate = (id, stars) => {
    setRatedItems((prev) => ({ ...prev, [id]: stars }));
    showToast(`Rated ${stars} stars! Saved to your profile.`, 'success');
  };

  const isFavorited = (id) => favorites.some((f) => f.id === id);

  // 6 Primary Space-Maximized Action Blocks (from Reference Image 1)
  const actionBlocks = [
    {
      id: 'plantrip',
      title: 'Build an itinerary',
      desc: 'Day-by-day, made around you',
      icon: '🗺️',
      tint: 'tint-mint',
      target: 'plantrip',
    },
    {
      id: 'budget',
      title: 'Plan my budget',
      desc: 'Smart splits & daily limits',
      icon: '💳',
      tint: 'tint-peach',
      target: 'budget',
    },
    {
      id: 'contribute',
      title: 'Find hidden gems',
      desc: 'Local favorites, minus the crowds',
      icon: '💎',
      tint: 'tint-emerald',
      target: 'contribute',
    },
    {
      id: 'map',
      title: 'Live GPS radar',
      desc: 'Vector waypoints & water channels',
      icon: '📍',
      tint: 'tint-gold',
      target: 'map',
    },
    {
      id: 'transit',
      title: 'Water Metro hub',
      desc: 'Electric ferries & rapid lines',
      icon: '⛴️',
      tint: 'tint-cyan',
      target: 'transit',
    },
    {
      id: 'events',
      title: 'Culture & events',
      desc: 'Multiplex showtimes & recitals',
      icon: '🎭',
      tint: 'tint-coral',
      target: 'events',
    },
  ];

  return (
    <div className="dashboard-layout-wrap animate-fade-in">
      {/* ============================================================== */}
      {/* 1. TOP METRIC / STATUS TICKER STRIP (From Reference Image 2)   */}
      {/* ============================================================== */}
      <div className="dash-metric-chips-strip">
        <div className="dmc-pill" onClick={() => onNavigate('budget')}>
          <span className="dmc-icon">🪙</span>
          <div className="dmc-text">
            <span className="dmc-label">Expense split</span>
            <span className="dmc-val">₹3,800 left</span>
          </div>
        </div>

        <div className="dmc-pill" onClick={() => onNavigate('transit')}>
          <span className="dmc-icon">⛴️</span>
          <div className="dmc-text">
            <span className="dmc-label">Water Metro</span>
            <span className="dmc-val">Line 1 Active</span>
          </div>
        </div>

        <div className="dmc-pill">
          <span className="dmc-icon">🌅</span>
          <div className="dmc-text">
            <span className="dmc-label">Sunset glow</span>
            <span className="dmc-val">{weather.sunsetTime}</span>
          </div>
        </div>

        <div className="dmc-pill">
          <span className="dmc-icon">🌱</span>
          <div className="dmc-text">
            <span className="dmc-label">Air quality</span>
            <span className="dmc-val">{weather.airQuality || 'AQI 35 Good'}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. "START SOMEWHERE" 2-COLUMN ACTION BLOCKS (Reference Image 1) */}
      {/* ============================================================== */}
      <div className="decision-blocks-section">
        <div className="dash-section-head">
          <div>
            <span className="section-eyebrow-green">START SOMEWHERE</span>
            <h2 className="dash-section-title">What can we help with?</h2>
          </div>
          <button
            type="button"
            className="dash-section-arrow-btn"
            onClick={() => onNavigate('plantrip')}
            title="Browse all planning tools"
          >
            <span>➔</span>
          </button>
        </div>

        <div className="decision-blocks-grid">
          {actionBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              className="decision-block-card"
              onClick={() => onNavigate(block.target)}
            >
              <div className="dbc-top">
                <div className={`dbc-icon-box ${block.tint}`}>
                  <span>{block.icon}</span>
                </div>
                <div className="dbc-chevron-btn">
                  <span>›</span>
                </div>
              </div>
              <div className="dbc-title">{block.title}</div>
              <div className="dbc-desc">{block.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LIVE TRIP INTELLIGENCE ALERT CARD (Reference Image 1 & 2)   */}
      {/* ============================================================== */}
      <div className="live-intel-banner-card">
        <div className="libc-top">
          <div className="libc-eyebrow-row">
            <span className="libc-umbrella-icon">⛱️</span>
            <span className="libc-eyebrow">LIVE TRIP INTELLIGENCE</span>
          </div>
          <span className="libc-time-tag">JUST NOW</span>
        </div>
        <h3 className="libc-headline">Sunset & Breezy Waterways in {currentCity}</h3>
        <p className="libc-body">
          {weather.condition}. Golden hour starts around {weather.sunsetTime}. High Court ↔ Vypin electric water metro ferry is running every 15 mins on schedule.
        </p>
        <div className="libc-actions-row">
          <button
            type="button"
            className="btn-ai-replan"
            onClick={() => {
              onNavigate('plantrip');
              showToast('Instant AI itinerary optimized for sunset!', 'success');
            }}
          >
            <span>Instant AI re-plan ✨</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. UPCOMING JOURNEY / ACTIVE TRIP HERO CARD (Reference Image 2)*/}
      {/* ============================================================== */}
      <div className="upcoming-journey-card">
        <div
          className="ujc-hero-image"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(11, 27, 20, 0.25) 0%, rgba(11, 27, 20, 0.88) 100%), url(${heroImage})` }}
        >
          <div className="ujc-top-badges">
            <span className="ujc-status-pill">
              <span className="ujc-pulsing-dot"></span>
              <span>ACTIVE EXPEDITION</span>
            </span>
            <button
              type="button"
              className="ujc-bookmark-btn"
              onClick={() => {
                onToggleFavorite({ id: `city_${currentCity}`, title: `${currentCity} Journey`, itemType: 'trip' });
                showToast(isFavorited(`city_${currentCity}`) ? 'Removed from saved trips' : 'Saved to your collection ❤️', 'info');
              }}
              title="Save expedition"
            >
              <span>{isFavorited(`city_${currentCity}`) ? '❤️' : '🔖'}</span>
            </button>
          </div>

          <div className="ujc-overlay-content">
            <div className="ujc-sub-label">UPCOMING JOURNEY</div>
            <h3 className="ujc-title">Misty Trails & Waterways of {currentCity}</h3>
            <div className="ujc-date">📅 Today · 4 curated multi-modal stops</div>
          </div>
        </div>

        <div className="ujc-bottom-strip">
          <div className="ujc-travellers-group">
            <div className="traveller-avatars">
              <div className="t-avatar avatar-orange">{initial}</div>
              <div className="t-avatar avatar-green">AK</div>
            </div>
            <div className="traveller-meta">
              <span className="tm-count">2 travellers</span>
              <span className="tm-pace">Balanced pace</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-view-itinerary"
            onClick={() => onNavigate('plantrip')}
          >
            <span>View itinerary ➔</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. WEATHER INTELLIGENCE BLOCK (Reference Image 2)              */}
      {/* ============================================================== */}
      <div className="weather-intelligence-block">
        <div className="wib-header">
          <div>
            <span className="section-eyebrow-green">LIVE IN {currentCity.toUpperCase()}</span>
            <h3 className="wib-title">Weather intelligence</h3>
          </div>
          <div className="wib-temp-badge">
            <span className="wtb-icon">☀️</span>
            <span className="wtb-val">{weather.temp}</span>
          </div>
        </div>

        <div className="wib-advice-box">
          <span className="wib-advice-icon">⛱️</span>
          <div className="wib-advice-text">
            <b>Pack a light evening breeze layer</b>
            <p>Brief golden hour lighting around 5:45 PM. We've moved your waterfront walk earlier to capture the sunset.</p>
          </div>
        </div>

        <div className="wib-forecast-grid">
          <div className="wib-day-chip active">
            <span className="wdc-name">TODAY</span>
            <span className="wdc-icon">☀️</span>
            <span className="wdc-temp">{weather.temp}</span>
          </div>
          <div className="wib-day-chip">
            <span className="wdc-name">FRI</span>
            <span className="wdc-icon">⛅</span>
            <span className="wdc-temp">28°C</span>
          </div>
          <div className="wib-day-chip">
            <span className="wdc-name">SAT</span>
            <span className="wdc-icon">☀️</span>
            <span className="wdc-temp">30°C</span>
          </div>
          <div className="wib-day-chip">
            <span className="wdc-name">SUN</span>
            <span className="wdc-icon">🌧️</span>
            <span className="wdc-temp">27°C</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. CINEMA & MULTIPLEX SHOWTIMES (Space-Maximized Block Layout) */}
      {/* ============================================================== */}
      {userLikes.includes('movies') && (
        <div className="card-box dynamic-dash-section">
          <div className="dds-header">
            <div>
              <span className="section-eyebrow-green">🎬 CINEMA & ENTERTAINMENT</span>
              <h3 className="dds-title">Now Showing in {currentCity} Multiplexes</h3>
            </div>
            <button
              type="button"
              className="btn-subtle btn-sm"
              onClick={() => showToast('Refreshed local cinema showtimes', 'info')}
            >
              Check Theaters ➔
            </button>
          </div>

          <div className="movies-dash-grid app-carousel-container">
            {(cityData?.movies || []).map((movie, idx) => {
              const movieImg = getEntityImage(movie, 'movies', idx);
              return (
                <div key={movie.id} className="movie-visual-card">
                  <div
                    className="mvc-photo-wrap"
                    style={{ backgroundImage: `url(${movieImg})` }}
                  >
                    <div className="mvc-badges-float">
                      <span className="mvc-genre-pill">{movie.genre}</span>
                      <span className="mvc-rating-pill">★ {movie.rating}</span>
                    </div>
                    <span className="mvc-lang-tag">{movie.language}</span>
                  </div>

                  <div className="mvc-content">
                    <h4 className="mvc-title">{movie.title}</h4>
                    <div className="mvc-theater">📍 {movie.theater}</div>

                    <div className="mvc-showtimes">
                      {movie.showtimes.map((st, i) => (
                        <span key={i} className="showtime-chip">{st}</span>
                      ))}
                    </div>

                    <div className="mvc-footer">
                      <div className="star-rating-bar">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star-icon ${star <= (ratedItems[movie.id] || Math.floor(movie.rating)) ? 'gold' : ''}`}
                            onClick={() => handleRate(movie.id, star)}
                            title={`Rate ${star} stars`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="mvc-actions">
                        <button
                          type="button"
                          className="btn-subtle btn-sm"
                          onClick={() => {
                            onToggleFavorite({ id: movie.id, title: movie.title, itemType: 'movie', city: currentCity });
                            showToast(isFavorited(movie.id) ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
                          }}
                          title="Save to favorites"
                        >
                          {isFavorited(movie.id) ? '❤️' : '🤍'}
                        </button>
                        <button
                          type="button"
                          className="btn-prime btn-sm"
                          onClick={() => {
                            onAddToTrip({ name: `${movie.title} (${movie.theater.split(',')[0]})`, category: 'Cinema', cost: 220 });
                            showToast(`Added "${movie.title}" to trip itinerary!`, 'success');
                          }}
                        >
                          ➕ Itinerary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. ARTISAN CAFES & DINING (Space-Maximized Block Layout)        */}
      {/* ============================================================== */}
      {userLikes.includes('cafes') && (
        <div className="card-box dynamic-dash-section">
          <div className="dds-header">
            <div>
              <span className="section-eyebrow-green">☕ CULINARY & AESTHETIC DINING</span>
              <h3 className="dds-title">Top Rated Artisan Cafes & Street Food</h3>
            </div>
            <button
              type="button"
              className="btn-subtle btn-sm"
              onClick={() => onNavigate('contribute')}
            >
              Explore All Places ➔
            </button>
          </div>

          <div className="cafes-dash-grid app-carousel-container">
            {(cityData?.cafes || []).map((cafe, idx) => {
              const cafeImg = getEntityImage(cafe, 'cafes', idx);
              return (
                <div key={cafe.id} className="cafe-visual-card">
                  <div
                    className="cvc-photo-wrap"
                    style={{ backgroundImage: `url(${cafeImg})` }}
                  >
                    <div className="cvc-badges-float">
                      <span className="cvc-cat-pill">{cafe.category}</span>
                      <span className="cvc-tier-pill">{cafe.priceTier}</span>
                    </div>
                    <span className="cvc-rating-pill">★ {cafe.rating}</span>
                  </div>

                  <div className="cvc-content">
                    <h4 className="cvc-name">{cafe.name}</h4>
                    <div className="cvc-area">📍 {cafe.area}</div>
                    <div className="cvc-specialty">
                      <span>✨ Specialty:</span> {cafe.specialty}
                    </div>

                    <div className="cvc-footer">
                      <div className="star-rating-bar">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star-icon ${star <= (ratedItems[cafe.id] || Math.floor(cafe.rating)) ? 'gold' : ''}`}
                            onClick={() => handleRate(cafe.id, star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn-prime btn-sm"
                        onClick={() => {
                          onAddToTrip({ name: cafe.name, category: 'Food', cost: 150 });
                          showToast(`Added "${cafe.name}" to trip!`, 'success');
                        }}
                      >
                        ➕ Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. WATER METRO & RAPID MOBILITY                                */}
      {/* ============================================================== */}
      {userLikes.includes('transit') && (
        <div className="card-box dynamic-dash-section">
          <div className="dds-header">
            <div>
              <span className="section-eyebrow-green">⛴️ WATER METRO & RAPID MOBILITY</span>
              <h3 className="dds-title">Live {currentCity} Public Transit Status</h3>
            </div>
            <button
              type="button"
              className="btn-subtle btn-sm"
              onClick={() => onNavigate('transit')}
            >
              View All Timetables ➔
            </button>
          </div>

          <div className="transit-mini-grid app-carousel-container">
            {(cityData?.transit || []).slice(0, 3).map((tItem, idx) => {
              const transitImg = getEntityImage(tItem, 'transit', idx);
              return (
                <div key={tItem.id} className="transit-visual-card">
                  <div
                    className="tvc-photo-thumb"
                    style={{ backgroundImage: `url(${transitImg})` }}
                  >
                    <span className="tvc-badge-type">
                      {tItem.type.includes('Water') || tItem.type.includes('Ferry') ? '⛴️' : '🚆'}
                    </span>
                  </div>

                  <div className="tvc-info">
                    <div className="tvc-top-row">
                      <div className="tvc-name">{tItem.name}</div>
                      <span className="tvc-fare-badge">{tItem.fare}</span>
                    </div>
                    <div className="tvc-sub">{tItem.route} • {tItem.frequency}</div>
                    <div className="tvc-bottom-row">
                      <span className="tvc-status-pill">{tItem.status}</span>
                      <span className="tvc-scenic">⭐ {tItem.scenicRating}/5 Scenic Score</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
