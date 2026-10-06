import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getEntityImage } from '../visualAssets.js';

// Pre-defined real coordinates for all supported destinations
const CITY_COORDINATES = {
  Kochi: { center: [9.9655, 76.2420], zoom: 13 },
  Tokyo: { center: [35.6762, 139.6503], zoom: 13 },
  Paris: { center: [48.8566, 2.3522], zoom: 13 },
  London: { center: [51.5074, -0.1278], zoom: 13 },
  NewYork: { center: [40.7128, -74.0060], zoom: 13 },
  Dubai: { center: [25.2048, 55.2708], zoom: 13 },
};

// Fallback high-fidelity real landmarks with precise coordinates if offline/loading
const FALLBACK_LANDMARKS = {
  Kochi: [
    { id: 'k1', name: 'High Court Water Metro Jetty', type: 'transit', lat: 9.9800, lng: 76.2760, category: 'Ferry Terminal', rating: 4.9, fee: '₹20', bestTime: '06:00 - 22:00', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
    { id: 'k2', name: 'Fort Kochi Beach & Shoreline', type: 'sunset', lat: 9.9660, lng: 76.2415, category: 'Promenade', rating: 4.8, fee: 'Free', bestTime: '17:30 - 18:30', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { id: 'k3', name: 'Kashi Art Cafe & Courtyard', type: 'food', lat: 9.9655, lng: 76.2420, category: 'Artisan Cafe', rating: 4.8, fee: '₹350', bestTime: '09:00 - 21:00', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
    { id: 'k4', name: 'Mattancherry Jewish Synagogue', type: 'heritage', lat: 9.9575, lng: 76.2590, category: 'Heritage', rating: 4.7, fee: '₹10', bestTime: '10:00 - 17:00', imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80' },
    { id: 'k5', name: 'Shenoys Multiplex Cinema', type: 'movie', lat: 9.9730, lng: 76.2820, category: 'Cinema', rating: 4.8, fee: '₹220', bestTime: '14:00 - 23:00', imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80' },
    { id: 'k6', name: 'Vypin Island Jetty', type: 'transit', lat: 9.9920, lng: 76.2370, category: 'Ferry Terminal', rating: 4.7, fee: '₹20', bestTime: 'Every 15m', imageUrl: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=600&q=80' },
  ],
  Tokyo: [
    { id: 'tok1', name: 'Shibuya Crossing & Hachiko', type: 'sunset', lat: 35.6595, lng: 139.7004, category: 'Iconic Spot', rating: 4.9, fee: 'Free', bestTime: '18:00 - 22:00', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80' },
    { id: 'tok2', name: 'Tokyo Water Bus (Asakusa Pier)', type: 'transit', lat: 35.7110, lng: 139.7970, category: 'Futuristic Ferry', rating: 4.8, fee: '¥1,720', bestTime: '10:00 - 18:00', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
    { id: 'tok3', name: 'TOHO Cinemas Shinjuku (Godzilla)', type: 'movie', lat: 35.6950, lng: 139.7020, category: 'IMAX Cinema', rating: 4.9, fee: '¥2,000', bestTime: '12:00 - 23:30', imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80' },
    { id: 'tok4', name: 'Senso-ji Temple', type: 'heritage', lat: 35.7147, lng: 139.7967, category: 'Heritage', rating: 4.8, fee: 'Free', bestTime: '06:00 - 17:00', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
  ],
  Paris: [
    { id: 'par1', name: 'Eiffel Tower Sunset Lawn', type: 'sunset', lat: 48.8584, lng: 2.2945, category: 'Iconic View', rating: 4.9, fee: '€18', bestTime: '19:00 - 21:00', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
    { id: 'par2', name: 'Batobus Seine River Shuttle', type: 'transit', lat: 48.8580, lng: 2.2930, category: 'River Ferry', rating: 4.8, fee: '€19', bestTime: '10:00 - 20:00', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    { id: 'par3', name: 'Louvre Museum & Glass Pyramid', type: 'heritage', lat: 48.8606, lng: 2.3376, category: 'Art & Heritage', rating: 4.9, fee: '€22', bestTime: '09:00 - 18:00', imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=600&q=80' },
    { id: 'par4', name: 'Le Grand Rex Cinema & Club', type: 'movie', lat: 48.8705, lng: 2.3480, category: 'Historic Cinema', rating: 4.8, fee: '€14', bestTime: '14:00 - 23:00', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
  ],
  London: [
    { id: 'lon1', name: 'Uber Boat Thames Clippers Pier', type: 'transit', lat: 51.5033, lng: -0.1195, category: 'Fast Ferry', rating: 4.9, fee: '£9.80', bestTime: 'Every 15m', imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=600&q=80' },
    { id: 'lon2', name: 'BFI IMAX Waterloo', type: 'movie', lat: 51.5050, lng: -0.1130, category: 'Largest Screen', rating: 4.9, fee: '£18', bestTime: '13:00 - 23:00', imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80' },
    { id: 'lon3', name: 'Tower Bridge Glass Floor', type: 'heritage', lat: 51.5055, lng: -0.0754, category: 'Historic View', rating: 4.8, fee: '£12', bestTime: '10:00 - 18:00', imageUrl: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=600&q=80' },
  ],
  NewYork: [
    { id: 'nyc1', name: 'NYC Ferry Pier 11 Wall Street', type: 'transit', lat: 40.7035, lng: -74.0070, category: 'Water Ferry', rating: 4.9, fee: '$4.00', bestTime: '06:30 - 22:00', imageUrl: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80' },
    { id: 'nyc2', name: 'Brooklyn Bridge Sunset Walk', type: 'sunset', lat: 40.7061, lng: -73.9969, category: 'Skyline View', rating: 4.9, fee: 'Free', bestTime: '17:45 - 19:00', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
    { id: 'nyc3', name: 'AMC Lincoln Square IMAX 70mm', type: 'movie', lat: 40.7740, lng: -73.9820, category: 'Premiere Cinema', rating: 4.8, fee: '$24', bestTime: '12:00 - 23:45', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
  ],
  Dubai: [
    { id: 'dxb1', name: 'Dubai Ferry Marina Walk', type: 'transit', lat: 25.0770, lng: 55.1320, category: 'Scenic Cruise', rating: 4.9, fee: 'AED 25', bestTime: '17:00 - 21:00', imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80' },
    { id: 'dxb2', name: 'Burj Khalifa Sky Deck', type: 'sunset', lat: 25.1972, lng: 55.2744, category: 'Observation Deck', rating: 4.8, fee: 'AED 179', bestTime: '17:30 - 18:30', imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80' },
  ],
};

const MAP_STYLES = {
  satellite: {
    id: 'satellite',
    name: '🛰️ Satellite',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    name: '🌙 Dark Radar',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  streets: {
    id: 'streets',
    name: '🗺️ Streets',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, DeLorme',
    maxZoom: 19,
  },
  topo: {
    id: 'topo',
    name: '🏔️ Topo Terrain',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, USGS',
    maxZoom: 19,
  },
};

export default function MapExplorerView({
  currentCity = 'Kochi',
  cityData,
  onAddToTrip,
  onToggleFavorite,
  favorites = [],
  showToast,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('all');
  const [mapStyle, setMapStyle] = useState('satellite'); // Default to Satellite view
  const [selectedPin, setSelectedPin] = useState(null);
  const [showRoute, setShowRoute] = useState(true);

  // Active landmarks source
  const rawLandmarks = cityData?.mapData?.landmarks?.length
    ? cityData.mapData.landmarks
    : FALLBACK_LANDMARKS[currentCity] || FALLBACK_LANDMARKS.Kochi;

  // Filter landmarks by category
  const filteredPins = rawLandmarks.filter((pin) => {
    if (activeLayer === 'all') return true;
    if (activeLayer === 'transit') return pin.type === 'transit';
    if (activeLayer === 'food') return pin.type === 'food';
    if (activeLayer === 'sunset') return pin.type === 'sunset';
    if (activeLayer === 'heritage') return pin.type === 'heritage';
    if (activeLayer === 'movie') return pin.type === 'movie';
    return true;
  });

  const getPinIcon = (type) => {
    switch (type) {
      case 'transit': return '⛴️';
      case 'food': return '☕';
      case 'sunset': return '🌅';
      case 'heritage': return '🏛️';
      case 'movie': return '🎬';
      default: return '📍';
    }
  };

  const isFavorited = (pinId) => favorites.some((f) => f.id === pinId);

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const cityMeta = CITY_COORDINATES[currentCity] || CITY_COORDINATES.Kochi;
    const initialCenter = cityData?.mapData?.center || cityMeta.center;
    const initialZoom = cityData?.mapData?.zoom || cityMeta.zoom;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false, // We supply custom floating controls
      attributionControl: true,
    });

    // Add Base & Optional Label Tile Layers
    const activeTile = MAP_STYLES[mapStyle] || MAP_STYLES.satellite;
    const baseLayer = L.tileLayer(activeTile.base, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom || 19,
    }).addTo(map);
    tileLayerRef.current = baseLayer;

    if (activeTile.labels) {
      const labelsLayer = L.tileLayer(activeTile.labels, {
        maxZoom: activeTile.maxZoom || 19,
        opacity: 0.92,
      }).addTo(map);
      labelsLayerRef.current = labelsLayer;
    }

    // Feature Groups
    markersLayerRef.current = L.featureGroup().addTo(map);
    routePolylineRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    // Fix map container size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Style Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const activeTile = MAP_STYLES[mapStyle] || MAP_STYLES.satellite;

    // Remove previous base and labels layers
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    // Add new base layer
    const baseLayer = L.tileLayer(activeTile.base, {
      attribution: activeTile.attribution,
      maxZoom: activeTile.maxZoom || 19,
    }).addTo(map);
    tileLayerRef.current = baseLayer;

    // Add new labels layer if configured
    if (activeTile.labels) {
      const labelsLayer = L.tileLayer(activeTile.labels, {
        maxZoom: activeTile.maxZoom || 19,
        opacity: 0.92,
      }).addTo(map);
      labelsLayerRef.current = labelsLayer;
    }
  }, [mapStyle]);

  // Handle City Change (Fly To new city coordinates)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const cityMeta = CITY_COORDINATES[currentCity] || CITY_COORDINATES.Kochi;
    const targetCenter = cityData?.mapData?.center || cityMeta.center;
    const targetZoom = cityData?.mapData?.zoom || cityMeta.zoom;

    mapInstanceRef.current.flyTo(targetCenter, targetZoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });
  }, [currentCity, cityData]);

  // Render Real Markers & Route Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    const routeGroup = routePolylineRef.current;

    markersGroup.clearLayers();
    routeGroup.clearLayers();

    if (filteredPins.length === 0) return;

    const latlngs = [];

    filteredPins.forEach((pin) => {
      if (!pin.lat || !pin.lng) return;

      latlngs.push([pin.lat, pin.lng]);
      const iconEmoji = getPinIcon(pin.type);
      const isSelected = selectedPin?.id === pin.id;

      // Custom pulsing HTML marker element
      const customHtml = `
        <div class="real-leaflet-marker ${isSelected ? 'selected' : ''} type-${pin.type}">
          <div class="rlm-pulse"></div>
          <div class="rlm-body">
            <span class="rlm-emoji">${iconEmoji}</span>
          </div>
          <div class="rlm-label">${pin.name.split(' ')[0]}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-divicon',
        html: customHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

      // Rich interactive HTML popup with image & action buttons
      const photoUrl = pin.imageUrl || getEntityImage(pin, 'landmarks', 0);
      const popupHtml = `
        <div class="real-map-popup-card">
          <div class="rmp-img-wrap" style="background-image: url('${photoUrl}');">
            <span class="rmp-type-badge">${iconEmoji} ${pin.category || 'Waypoint'}</span>
            <span class="rmp-rating">★ ${pin.rating || 4.8}</span>
          </div>
          <div class="rmp-content">
            <h4 class="rmp-title">${pin.name}</h4>
            <div class="rmp-meta-strip">
              <span>🎟️ ${pin.fee || 'Free'}</span>
              <span>•</span>
              <span>⏰ ${pin.bestTime || 'Daytime'}</span>
            </div>
            <div class="rmp-btn-row">
              <button class="rmp-add-btn" id="popup-add-${pin.id}">
                ➕ Add to Trip
              </button>
              <button class="rmp-fav-btn" id="popup-fav-${pin.id}">
                ${isFavorited(pin.id) ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 290,
        className: 'real-leaflet-custom-popup',
      });

      marker.on('click', () => {
        setSelectedPin(pin);
      });

      // Hook click events inside Leaflet popup DOM
      marker.on('popupopen', () => {
        setTimeout(() => {
          const addBtn = document.getElementById(`popup-add-${pin.id}`);
          const favBtn = document.getElementById(`popup-fav-${pin.id}`);

          if (addBtn) {
            addBtn.onclick = () => {
              onAddToTrip && onAddToTrip(pin);
              showToast(`Added "${pin.name}" to trip plan!`, 'success');
            };
          }
          if (favBtn) {
            favBtn.onclick = () => {
              onToggleFavorite && onToggleFavorite(pin);
              showToast(isFavorited(pin.id) ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
              favBtn.innerText = isFavorited(pin.id) ? '🤍' : '❤️';
            };
          }
        }, 50);
      });

      markersGroup.addLayer(marker);
    });

    // Draw scenic connecting route polyline
    if (showRoute && latlngs.length >= 2) {
      const polyline = L.polyline(latlngs, {
        color: '#E5A93C',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });
      routeGroup.addLayer(polyline);
    }
  }, [filteredPins, selectedPin, showRoute, favorites]);

  // Fly to Pin from bottom carousel or search
  const handleSelectWaypoint = (pin) => {
    setSelectedPin(pin);
    if (!mapInstanceRef.current || !pin.lat || !pin.lng) return;

    mapInstanceRef.current.flyTo([pin.lat, pin.lng], 15, {
      duration: 1.0,
      easeLinearity: 0.25,
    });

    // Find marker and open popup
    if (markersLayerRef.current) {
      markersLayerRef.current.eachLayer((layer) => {
        const latLng = layer.getLatLng();
        if (Math.abs(latLng.lat - pin.lat) < 0.0001 && Math.abs(latLng.lng - pin.lng) < 0.0001) {
          layer.openPopup();
        }
      });
    }
  };

  const handleCenterCity = () => {
    if (!mapInstanceRef.current) return;
    const cityMeta = CITY_COORDINATES[currentCity] || CITY_COORDINATES.Kochi;
    const center = cityData?.mapData?.center || cityMeta.center;
    mapInstanceRef.current.flyTo(center, 13, { duration: 1.0 });
    showToast(`Centered map on ${currentCity}`, 'info');
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const bounds = markersLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      showToast('Fitted all waypoints into view', 'info');
    }
  };

  const cityCoords = CITY_COORDINATES[currentCity] || CITY_COORDINATES.Kochi;

  return (
    <div className="map-explorer-layout animate-fade-in">
      {/* Top Map Bar Controls */}
      <div className="card-box map-control-bar">
        <div className="mcb-left">
          <div className="mcb-title-group">
            <span className="live-gps-pill">
              <span className="pulsing-green-dot"></span>
              <span>LIVE GPS RADAR</span>
            </span>
            <h2 className="mcb-city-name">{currentCity} Interactive Real Map</h2>
          </div>
          <span className="mcb-coords">
            📍 {cityCoords.center[0].toFixed(4)}° N, {cityCoords.center[1].toFixed(4)}° E • {filteredPins.length} Live Waypoints
          </span>
        </div>

        {/* Filter Layers */}
        <div className="map-layer-pills">
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLayer('all')}
          >
            <span>All Pins ({rawLandmarks.length})</span>
          </button>
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveLayer('transit')}
          >
            <span>⛴️ Transit & Ferries</span>
          </button>
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'food' ? 'active' : ''}`}
            onClick={() => setActiveLayer('food')}
          >
            <span>☕ Cafes & Dining</span>
          </button>
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'sunset' ? 'active' : ''}`}
            onClick={() => setActiveLayer('sunset')}
          >
            <span>🌅 Scenic Views</span>
          </button>
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'heritage' ? 'active' : ''}`}
            onClick={() => setActiveLayer('heritage')}
          >
            <span>🏛️ Heritage</span>
          </button>
          <button
            type="button"
            className={`mlp-btn ${activeLayer === 'movie' ? 'active' : ''}`}
            onClick={() => setActiveLayer('movie')}
          >
            <span>🎬 Cinemas</span>
          </button>
        </div>
      </div>

      {/* Main Real Map Viewport Box */}
      <div className="card-box map-viewport-box" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Real Leaflet Map Container */}
        <div
          ref={mapContainerRef}
          id="real-leaflet-map-canvas"
          className="real-leaflet-container"
          style={{ width: '100%', height: '520px', minHeight: '440px', background: '#0B1B14' }}
        />

        {/* Floating Map Controls: Tile Switcher, Route Toggle, Fit Bounds & Recenter */}
        <div className="real-map-floating-bar">
          {/* Tile Layer Styles */}
          <div className="rm-style-switch">
            {Object.values(MAP_STYLES).map((style) => (
              <button
                key={style.id}
                type="button"
                className={`rm-style-btn ${mapStyle === style.id ? 'active' : ''}`}
                onClick={() => setMapStyle(style.id)}
              >
                {style.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Route Polyline Toggle */}
            <button
              type="button"
              className={`rm-icon-btn ${showRoute ? 'active' : ''}`}
              onClick={() => setShowRoute(!showRoute)}
              title={showRoute ? 'Hide Route Line' : 'Show Route Line'}
            >
              <span>🧭 Route {showRoute ? 'ON' : 'OFF'}</span>
            </button>

            {/* Fit All Pins */}
            <button
              type="button"
              className="rm-icon-btn"
              onClick={handleFitBounds}
              title="Fit all pins in view"
            >
              <span>🔍 Fit</span>
            </button>

            {/* Recenter Center City */}
            <button
              type="button"
              className="rm-icon-btn"
              onClick={handleCenterCity}
              title="Center City GPS"
            >
              <span>🎯 Center</span>
            </button>
          </div>
        </div>

        {/* Floating Zoom Buttons (+ / -) */}
        <div className="real-map-zoom-buttons">
          <button
            type="button"
            className="rm-zoom-btn"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            className="rm-zoom-btn"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
          >
            –
          </button>
        </div>
      </div>

      {/* Bottom Landmark Quick Carousel */}
      <div className="map-landmarks-strip">
        <div className="mls-title-row">
          <span className="mls-title">📍 Live Waypoints in {currentCity} ({filteredPins.length}):</span>
          <span className="mls-sub-hint">Tap any card to fly camera to location</span>
        </div>

        <div className="mls-cards-scroll">
          {filteredPins.map((pin) => (
            <div
              key={pin.id}
              className={`mls-mini-card ${selectedPin?.id === pin.id ? 'active' : ''}`}
              onClick={() => handleSelectWaypoint(pin)}
            >
              <div
                className="mls-card-thumb"
                style={{ backgroundImage: `url(${pin.imageUrl || getEntityImage(pin, 'landmarks', 0)})` }}
              >
                <span className="mls-thumb-emoji">{getPinIcon(pin.type)}</span>
              </div>
              <div className="mls-mini-info">
                <div className="mls-mini-name">{pin.name}</div>
                <div className="mls-mini-sub">
                  ⭐ {pin.rating || 4.8} • {pin.category} • {pin.fee || 'Free'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
