import React, { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView.jsx';
import OnboardingView from './components/OnboardingView.jsx';
import MapExplorerView from './components/MapExplorerView.jsx';
import TransitHubView from './components/TransitHubView.jsx';
import BudgetTrackerView from './components/BudgetTrackerView.jsx';
import EventsView from './components/EventsView.jsx';
import PlanTripView from './components/PlanTripView.jsx';
import RearrangeTripView from './components/RearrangeTripView.jsx';
import FavoritesView from './components/FavoritesView.jsx';
import ContributePlacesView from './components/ContributePlacesView.jsx';
import ChatBotView from './components/ChatBotView.jsx';
import ProfileView from './components/ProfileView.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import OtpVerification from './components/OtpVerification.jsx';
import ShareModal from './components/ShareModal.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';
import EmergencyModal from './components/EmergencyModal.jsx';
import StoryPassModal from './components/StoryPassModal.jsx';
import SharedTripView from './components/SharedTripView.jsx';
import Toast from './components/Toast.jsx';
import { I18N } from './i18n.js';
import { API_URL } from './config.js';
import {
  IconExplore,
  IconMap,
  IconPlus,
  IconHeart,
  IconUser,
  IconSparkles,
  IconPin,
  IconShuffle,
  IconTransit,
  IconWallet,
  IconCalendar,
  IconBot,
  IconSOS,
  IconCamera,
  IconSun,
  IconMoon,
  IconBulb,
  IconLogOut,
} from './components/Icons.jsx';

const API_BASE = `${API_URL}/api/auth`;

const SUPPORTED_CITIES = [
  { id: 'Kochi', name: 'Kochi', country: 'India', flag: '🇮🇳' },
  { id: 'Tokyo', name: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { id: 'Paris', name: 'Paris', country: 'France', flag: '🇫🇷' },
  { id: 'London', name: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'NewYork', name: 'New York', country: 'United States', flag: '🇺🇸' },
  { id: 'Dubai', name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪' },
];

export default function App() {
  // Navigation: 'dashboard' | 'onboarding' | 'map' | 'plantrip' | 'rearrange' | 'transit' | 'budget' | 'events' | 'contribute' | 'favorites' | 'chatbot' | 'auth'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register' | 'otp'
  const [sidebarMini, setSidebarMini] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sharedTripCode, setSharedTripCode] = useState(null);

  // User & Settings
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('pocketroute_theme') || 'dark');
  const [lang, setLang] = useState(localStorage.getItem('pocketroute_lang') || 'en');
  const [serverOnline, setServerOnline] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Global City Selection & Intelligence Data
  const [currentCity, setCurrentCity] = useState('Kochi');
  const [cityData, setCityData] = useState(null);

  // Modals
  const [shareData, setShareData] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showStoryPassModal, setShowStoryPassModal] = useState(false);

  const t = I18N[lang] || I18N.en;

  // Deep-link routing for standalone shared trip plans
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';

      const tripMatch = hash.match(/#\/share\/trip\/([a-zA-Z0-9_-]+)/) || pathname.match(/\/share\/trip\/([a-zA-Z0-9_-]+)/);
      if (tripMatch && tripMatch[1]) {
        setSharedTripCode(tripMatch[1]);
        return;
      }
      setSharedTripCode(null);
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pocketroute_theme', theme);
  }, [theme]);

  // Language Sync
  useEffect(() => {
    localStorage.setItem('pocketroute_lang', lang);
  }, [lang]);

  // Check saved session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('pocketroute_user');
    const token = localStorage.getItem('pocketroute_token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.preferences?.selectedCity) {
          setCurrentCity(parsed.preferences.selectedCity);
        }
        if (parsed.hasCompletedOnboarding === false) {
          setActiveTab('onboarding');
        } else {
          setActiveTab('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('pocketroute_user');
        localStorage.removeItem('pocketroute_token');
      }
    }
  }, []);

  // Ping backend server
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        if (res.ok) setServerOnline(true);
        else setServerOnline(false);
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load intelligence data for selected global city
  useEffect(() => {
    const fetchCityIntelligence = async () => {
      try {
        const res = await fetch(`${API_URL}/api/intelligence/city/${currentCity}`);
        const data = await res.json();
        if (data.success && data.city) {
          setCityData(data.city);
        }
      } catch (err) {
        console.warn('Could not load city intelligence data:', err);
      }
    };
    fetchCityIntelligence();
  }, [currentCity]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 8);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  // Auth Handlers
  const handleRegisterSuccess = (userInfo) => {
    setPendingUser(userInfo);
    setAuthScreen('otp');
    showToast(`Verification code sent! Test OTP is 12345`, 'info');
  };

  const handleVerifySuccess = (verifiedUser) => {
    setUser(verifiedUser);
    localStorage.setItem('pocketroute_user', JSON.stringify(verifiedUser));

    // If onboarding not completed, guide to Likes selection
    if (!verifiedUser.hasCompletedOnboarding) {
      setActiveTab('onboarding');
      showToast(`Welcome ${verifiedUser.name.split(' ')[0]}! Please select your vibe.`, 'success');
    } else {
      setActiveTab('dashboard');
      showToast(`Welcome back, ${verifiedUser.name.split(' ')[0]}!`, 'success');
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('pocketroute_user', JSON.stringify(loggedInUser));

    if (!loggedInUser.hasCompletedOnboarding) {
      setActiveTab('onboarding');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Signed in as ${loggedInUser.name.split(' ')[0]}`, 'success');
  };

  const handleRequiresOtp = (userInfo) => {
    setPendingUser(userInfo);
    setAuthScreen('otp');
  };

  const handleLogout = () => {
    localStorage.removeItem('pocketroute_token');
    localStorage.removeItem('pocketroute_user');
    setUser(null);
    setPendingUser(null);
    setAuthScreen('login');
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
    setShareData(null);
    setShowFeedbackModal(false);
    showToast('Signed out successfully. Please sign in to continue.', 'info');
  };

  const handleGuestBypass = () => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest Explorer',
      email: 'guest@pocketroute.local',
      mobile: '9847012345',
      isGuest: true,
      hasCompletedOnboarding: false,
      preferences: {
        likes: ['movies', 'travel', 'cafes', 'transit', 'heritage', 'events', 'sunsets'],
        dislikes: [],
        selectedCity: currentCity,
        currency: 'INR',
      },
      favorites: [],
    };
    localStorage.setItem('pocketroute_token', 'guest_token_' + Date.now());
    localStorage.setItem('pocketroute_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setActiveTab('onboarding');
    showToast('Entered as Guest Explorer! Let us configure your preferences.', 'info');
  };

  const handleOnboardingComplete = (savedPrefs) => {
    const updatedUser = {
      ...(user || {}),
      hasCompletedOnboarding: true,
      preferences: {
        ...(user?.preferences || {}),
        ...savedPrefs,
      },
    };
    setUser(updatedUser);
    localStorage.setItem('pocketroute_user', JSON.stringify(updatedUser));
    if (savedPrefs.selectedCity) {
      setCurrentCity(savedPrefs.selectedCity);
    }
    setActiveTab('dashboard');
    showToast('Preferences saved! Dashboard customized for your vibe ✨', 'success');
  };

  // Toggle Favorite Item in Database
  const handleToggleFavorite = async (item) => {
    if (!item) return;
    try {
      const uid = user?.id || user?._id || 'guest';
      const res = await fetch(`${API_URL}/api/auth/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, item }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedFavorites = data.favorites || [];
        const updatedUser = { ...(user || {}), favorites: updatedFavorites };
        setUser(updatedUser);
        localStorage.setItem('pocketroute_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.warn('Favorite toggled in local state:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconSparkles size={18} />, badge: 'Live' },
    { id: 'map', label: 'Map Explorer', icon: <IconPin size={18} />, badge: 'GPS' },
    { id: 'plantrip', label: 'Plan Trip', icon: <IconMap size={18} /> },
    { id: 'rearrange', label: 'Re-Arrange & AI', icon: <IconShuffle size={18} />, badge: 'AI' },
    { id: 'transit', label: 'Transit Hub', icon: <IconTransit size={18} /> },
    { id: 'budget', label: 'Budget & Split', icon: <IconWallet size={18} /> },
    { id: 'events', label: 'Events & Culture', icon: <IconCalendar size={18} /> },
    { id: 'contribute', label: 'Contribute Places', icon: <IconPlus size={18} />, badge: 'Crowd' },
    { id: 'favorites', label: 'My Favorites', icon: <IconHeart size={18} /> },
    { id: 'chatbot', label: 'AI Chat-Bot', icon: <IconBot size={18} />, badge: 'AI' },
  ];

  // Standalone Shared Trip View
  if (sharedTripCode) {
    return (
      <div className="pocketroute-app-shell">
        <SharedTripView
          shareCode={sharedTripCode}
          onOpenApp={() => {
            window.location.hash = '';
            setSharedTripCode(null);
            setActiveTab('dashboard');
          }}
          showToast={showToast}
        />
        <div className="toast-portal">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </div>
      </div>
    );
  }

  // When unauthenticated (!user), show Authentication Screen
  if (!user) {
    return (
      <div className="pocketroute-app-shell">
        <header className="pocketroute-navbar">
          <div className="brand-group">
            <div className="brand-title">
              <span>Pocket</span><b>Route</b>
            </div>
            <span className="brand-tagline">{t.app_tagline}</span>
          </div>

          <div className="navbar-right-controls">
            <div
              className={`server-status-pill ${serverOnline ? 'online' : 'connecting'}`}
              title={serverOnline ? 'MongoDB Atlas Cluster Connected' : 'Connecting to database...'}
            >
              <span className="pulse-dot"></span>
              <span className="status-label">{serverOnline ? 'Atlas Cloud Live' : 'Connecting...'}</span>
            </div>

            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Light / Dark Mode"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </header>

        <main className="auth-stage-container">
          <div className="auth-wrapper">
            {authScreen !== 'otp' && (
              <div className="auth-segmented-switch">
                <button
                  type="button"
                  className={`switch-tab-btn ${authScreen === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthScreen('login')}
                >
                  <span>🔑</span>
                  <span>{t.tab_login}</span>
                </button>
                <button
                  type="button"
                  className={`switch-tab-btn ${authScreen === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthScreen('register')}
                >
                  <span>✨</span>
                  <span>{t.tab_register}</span>
                </button>
              </div>
            )}

            {authScreen === 'login' && (
              <LoginForm
                t={t}
                onLoginSuccess={handleLoginSuccess}
                onRequiresOtp={handleRequiresOtp}
                onSwitchToRegister={() => setAuthScreen('register')}
                onGuestBypass={handleGuestBypass}
                showToast={showToast}
                API_BASE={API_BASE}
              />
            )}

            {authScreen === 'register' && (
              <RegisterForm
                t={t}
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setAuthScreen('login')}
                onGuestBypass={handleGuestBypass}
                showToast={showToast}
                API_BASE={API_BASE}
              />
            )}

            {authScreen === 'otp' && (
              <OtpVerification
                t={t}
                pendingUser={pendingUser}
                onVerifySuccess={handleVerifySuccess}
                onBackToRegister={() => setAuthScreen('register')}
                showToast={showToast}
                API_BASE={API_BASE}
              />
            )}
          </div>
        </main>

        <div className="toast-portal">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </div>
      </div>
    );
  }

  const activeLikes = user?.preferences?.likes || ['movies', 'travel', 'cafes', 'transit', 'heritage', 'events', 'sunsets'];
  const userFavorites = user?.favorites || [];

  return (
    <div className={`pocketroute-app-shell ${sidebarMini ? 'mini-sidebar' : ''}`}>
      {/* Top Navbar */}
      <header className="pocketroute-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation drawer"
          >
            ☰
          </button>

          <div className="brand-group" onClick={() => setActiveTab('dashboard')}>
            <div className="brand-title">
              <span>Pocket</span><b>Route</b>
            </div>
            <span className="brand-tagline">Worldwide Location Intelligence</span>
          </div>
        </div>

        {/* Global City Selector & Navbar Controls */}
        <div className="navbar-right-controls">
          {/* Global City Selector Dropdown */}
          <div className="city-selector-wrap">
            <select
              className="city-select-dropdown"
              value={currentCity}
              onChange={(e) => {
                const nextCity = e.target.value;
                setCurrentCity(nextCity);
                showToast(`Switched active location to ${nextCity}`, 'success');
              }}
              title="Select Global Destination"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency SOS Button */}
          <button
            type="button"
            className="btn-sos-pulse"
            onClick={() => setShowEmergencyModal(true)}
            title="1-Tap Emergency & Safety Hotlines"
          >
            <IconSOS size={16} />
            <span className="hide-on-mobile">SOS Hub</span>
          </button>

          {/* 9:16 Story Pass Generator */}
          <button
            type="button"
            className="nav-icon-btn hide-on-mobile"
            onClick={() => setShowStoryPassModal(true)}
            title="Generate 9:16 Instagram Story Travel Pass"
          >
            <IconCamera size={16} />
            <span>Story Pass</span>
          </button>

          {/* MongoDB Atlas Live Connection Status */}
          <div
            className={`server-status-pill hide-on-mobile ${serverOnline ? 'online' : 'connecting'}`}
            title={serverOnline ? 'MongoDB Atlas Cluster Connected' : 'Connecting to database...'}
          >
            <span className="pulse-dot"></span>
            <span className="status-label">{serverOnline ? 'Atlas Live' : 'Connecting...'}</span>
          </div>

          {/* Suggestion Feedback Button */}
          <button
            type="button"
            className="nav-icon-btn hide-on-mobile"
            onClick={() => setShowFeedbackModal(true)}
            title="Send your suggestions"
          >
            <IconBulb size={17} />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>

          {/* User Profile & Session Suite */}
          <div className="nav-user-suite">
            {/* User Profile Chip */}
            <button
              type="button"
              className="nav-user-chip"
              onClick={() => setActiveTab('profile')}
              title={`Profile: ${user.name} (${user.email}) • View Vibes & Dashboard`}
            >
              <div className="nav-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <span className="nav-user-name hide-on-mobile">
                {user?.name ? user.name.split(' ')[0] : 'Explorer'}
              </span>
            </button>

            {/* Sign Out Button (Desktop only, mobile has it in drawer) */}
            <button
              type="button"
              className="nav-signout-btn hide-on-mobile"
              onClick={handleLogout}
              title="Sign out of PocketRoute"
            >
              <span className="signout-icon"><IconLogOut size={15} /></span>
              <span className="signout-label">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="pocketroute-body-layout">
        {/* Left Persistent Sidebar (Collapsible & Mobile Drawer) */}
        <aside className={`pocketroute-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-section-title">GLOBAL NAVIGATION</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="snb-icon">{item.icon}</span>
              <span className="snb-label">{item.label}</span>
              {item.badge && <span className="snb-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: '20px' }}>TOOLS & PROFILE</div>

          <button
            type="button"
            className="sidebar-nav-btn"
            onClick={() => {
              setActiveTab('onboarding');
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon"><IconSparkles size={17} /></span>
            <span className="snb-label">Edit Likes & Vibes</span>
          </button>

          <button
            type="button"
            className="sidebar-nav-btn"
            onClick={() => {
              setShowEmergencyModal(true);
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon"><IconSOS size={17} /></span>
            <span className="snb-label">Emergency SOS</span>
          </button>

          <button
            type="button"
            className="sidebar-nav-btn"
            onClick={() => {
              setShowFeedbackModal(true);
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon"><IconBulb size={17} /></span>
            <span className="snb-label">Feedback & Ideas</span>
          </button>

          <button
            type="button"
            className="sidebar-nav-btn hide-on-desktop"
            style={{ color: '#EF4444', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon"><IconLogOut size={17} /></span>
            <span className="snb-label">Sign Out</span>
          </button>

          <div style={{ flex: 1 }}></div>

          <button
            type="button"
            className="sidebar-nav-btn hide-on-mobile"
            onClick={() => setSidebarMini(!sidebarMini)}
          >
            <span className="snb-icon">{sidebarMini ? '⇥' : '⇤'}</span>
            <span className="snb-label">{sidebarMini ? 'Expand' : 'Collapse'}</span>
          </button>
        </aside>

        {/* Backdrop for Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Workspace */}
        <main className={`pocketroute-main-content ${activeTab === 'chatbot' ? 'chat-mode' : ''}`}>
          <div className={`content-inner-shell ${activeTab === 'chatbot' ? 'chat-inner-shell' : ''}`}>
            {/* VIEW: Onboarding (Likes & Dislikes) */}
            {activeTab === 'onboarding' && (
              <OnboardingView
                user={user}
                currentCity={currentCity}
                onComplete={handleOnboardingComplete}
                showToast={showToast}
              />
            )}

            {/* VIEW: Dynamic Personalized Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                currentCity={currentCity}
                cityData={cityData}
                userLikes={activeLikes}
                onNavigate={(tab) => setActiveTab(tab)}
                onLogout={handleLogout}
                onAddToTrip={(stop) => {
                  setActiveTab('plantrip');
                  showToast(`Added to trip! Set your itinerary times.`, 'success');
                }}
                onToggleFavorite={handleToggleFavorite}
                favorites={userFavorites}
                showToast={showToast}
              />
            )}

            {/* VIEW: Interactive Vector Map Explorer */}
            {activeTab === 'map' && (
              <MapExplorerView
                currentCity={currentCity}
                cityData={cityData}
                onAddToTrip={(landmark) => {
                  setActiveTab('plantrip');
                  showToast(`Imported landmark to trip planner!`, 'success');
                }}
                onToggleFavorite={handleToggleFavorite}
                favorites={userFavorites}
                showToast={showToast}
              />
            )}

            {/* VIEW: Smart Multi-Modal Trip Planner */}
            {activeTab === 'plantrip' && (
              <PlanTripView
                user={user}
                currentCity={currentCity}
                cityData={cityData}
                onTripCreated={(trip) => {
                  showToast('Trip itinerary created! Ready to customize or re-order.', 'success');
                }}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Re-Arrange & 1-Click AI Route Optimizer */}
            {activeTab === 'rearrange' && (
              <RearrangeTripView
                user={user}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Global Smart Transit Hub */}
            {activeTab === 'transit' && (
              <TransitHubView
                currentCity={currentCity}
                cityData={cityData}
                showToast={showToast}
              />
            )}

            {/* VIEW: Budget & Split with Friends */}
            {activeTab === 'budget' && (
              <BudgetTrackerView
                currentCity={currentCity}
                currencySymbol={cityData?.currencySymbol || '₹'}
                showToast={showToast}
              />
            )}

            {/* VIEW: Regional & Worldwide Events Calendar */}
            {activeTab === 'events' && (
              <EventsView
                currentCity={currentCity}
                cityData={cityData}
                onAddToTrip={(ev) => {
                  setActiveTab('plantrip');
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: Crowd-Sourced Places (with Photos & Ratings) */}
            {activeTab === 'contribute' && (
              <ContributePlacesView
                user={user}
                showToast={showToast}
              />
            )}

            {/* VIEW: My Favorites & Saved Items */}
            {activeTab === 'favorites' && (
              <FavoritesView
                user={user}
                onSelectTrip={() => setActiveTab('rearrange')}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* VIEW: AI Travel Chatbot ("Budgo AI") */}
            {activeTab === 'chatbot' && (
              <ChatBotView
                user={user}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Profile & Space-Maximized Settings (Reference Screenshot 5) */}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                currentCity={currentCity}
                onLogout={handleLogout}
                onNavigate={(tab) => setActiveTab(tab)}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* NATIVE MOBILE BOTTOM APPLICATION BAR (Fixed for Touch Screens) */}
      {/* ============================================================== */}
      <nav className="mobile-bottom-app-bar" aria-label="Mobile Bottom Navigation">
        <button
          type="button"
          className={`mba-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            setMobileMenuOpen(false);
          }}
        >
          <span className="mba-icon"><IconExplore size={22} /></span>
          <span className="mba-label">Explore</span>
        </button>

        <button
          type="button"
          className={`mba-tab ${activeTab === 'plantrip' || activeTab === 'rearrange' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('plantrip');
            setMobileMenuOpen(false);
          }}
        >
          <span className="mba-icon"><IconMap size={22} /></span>
          <span className="mba-label">My trips</span>
        </button>

        {/* Elevated Center Amber Contribute Button (Matches Reference Screenshots) */}
        <button
          type="button"
          className={`mba-tab mba-center-action-tab ${activeTab === 'contribute' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('contribute');
            setMobileMenuOpen(false);
          }}
          title="Contribute a Hidden Gem"
        >
          <div className="mba-floating-plus-btn">
            <IconPlus size={24} strokeWidth={3} />
          </div>
          <span className="mba-label">Contribute</span>
        </button>

        <button
          type="button"
          className={`mba-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('favorites');
            setMobileMenuOpen(false);
          }}
        >
          <span className="mba-icon"><IconHeart size={22} filled={activeTab === 'favorites'} /></span>
          <span className="mba-label">Favorites</span>
        </button>

        <button
          type="button"
          className={`mba-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setMobileMenuOpen(false);
          }}
        >
          <span className="mba-icon"><IconUser size={22} /></span>
          <span className="mba-label">Profile</span>
        </button>
      </nav>

      {/* Global Modals */}
      {shareData && (
        <ShareModal
          data={shareData}
          onClose={() => setShareData(null)}
          showToast={showToast}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          user={user}
          onClose={() => setShowFeedbackModal(false)}
          showToast={showToast}
        />
      )}

      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        currentCity={currentCity}
        cityData={cityData}
        showToast={showToast}
      />

      <StoryPassModal
        isOpen={showStoryPassModal}
        onClose={() => setShowStoryPassModal(false)}
        currentCity={currentCity}
        showToast={showToast}
      />

      {/* Toast Notification Portal */}
      <div className="toast-portal">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </div>
  );
}
