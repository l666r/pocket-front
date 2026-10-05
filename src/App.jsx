import React, { useState, useEffect } from 'react';
import ChatBotView from './components/ChatBotView.jsx';
import PlanTripView from './components/PlanTripView.jsx';
import RearrangeTripView from './components/RearrangeTripView.jsx';
import FavoritesView from './components/FavoritesView.jsx';
import ContributePlacesView from './components/ContributePlacesView.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import OtpVerification from './components/OtpVerification.jsx';
import ShareModal from './components/ShareModal.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';
import SharedTripView from './components/SharedTripView.jsx';
import Toast from './components/Toast.jsx';
import { I18N } from './i18n.js';
import { API_URL } from './config.js';

const API_BASE = `${API_URL}/api/auth`;

export default function App() {
  // Navigation: 'chatbot' | 'plantrip' | 'rearrange' | 'favorites' | 'contribute' | 'auth'
  const [activeTab, setActiveTab] = useState('chatbot');
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register' | 'otp'
  const [sidebarMini, setSidebarMini] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sharedTripCode, setSharedTripCode] = useState(null);

  // User & Settings
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('pocketroute_theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('pocketroute_lang') || 'en');
  const [serverOnline, setServerOnline] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modals
  const [shareData, setShareData] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pocketroute_theme', theme);
  }, [theme]);

  // Toggle Language
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
  };

  const handleVerifySuccess = (verifiedUser) => {
    setUser(verifiedUser);
    setActiveTab('chatbot');
    showToast(`Welcome to PocketRoute, ${verifiedUser.name.split(' ')[0]}!`, 'success');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab('chatbot');
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
    setActiveTab('chatbot');
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
    };
    localStorage.setItem('pocketroute_token', 'guest_token_' + Date.now());
    localStorage.setItem('pocketroute_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setActiveTab('chatbot');
    showToast('Entered as Guest Explorer', 'info');
  };

  const navItems = [
    { id: 'chatbot', label: 'Chat-Bot', icon: '🤖', badge: 'AI' },
    { id: 'plantrip', label: 'Plan the Trip', icon: '🗺️' },
    { id: 'rearrange', label: 'Re-Arrange your Trip', icon: '🔄' },
    { id: 'favorites', label: 'My Favorites', icon: '⭐' },
    { id: 'contribute', label: 'Contribute Places', icon: '📍', badge: 'Crowd' },
  ];

  const viewTitles = {
    chatbot: 'PocketRoute AI Chat-Bot',
    plantrip: 'Plan the Trip (Time, Budget, Traffic & Weather)',
    rearrange: 'Re-Arrange your Trip',
    favorites: 'My Favorites',
    contribute: 'Contribute Places (Google Maps Style)',
    auth: user ? 'Account Profile' : 'Sign In & Registration',
  };

  // Standalone Shared Trip View: when a shared trip link is opened, view only that trip plan
  if (sharedTripCode) {
    return (
      <div className="pocketroute-app-shell">
        <SharedTripView
          shareCode={sharedTripCode}
          onOpenApp={() => {
            window.location.hash = '';
            setSharedTripCode(null);
            setActiveTab('chatbot');
          }}
          showToast={showToast}
        />

        {/* Floating Toast Notification Portal */}
        <div className="toast-portal">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // When signed out or unauthenticated (!user), show ONLY the authentication screen
  // No sidebar, no chatbot, no trip plans, no app views are visible to signed-out users
  if (!user) {
    return (
      <div className="pocketroute-app-shell">
        {/* Top Navbar in Auth Mode */}
        <header className="pocketroute-navbar">
          <div className="brand-group">
            <div className="brand-title">
              <span>Pocket</span><b>Route</b>
            </div>
            <span className="brand-tagline">{t.app_tagline}</span>
          </div>

          <div className="navbar-right-controls">
            {/* MongoDB Atlas Live Connection Status */}
            <div
              className={`server-status-pill ${serverOnline ? 'online' : 'connecting'}`}
              title={serverOnline ? 'MongoDB Atlas Cluster Connected' : 'Connecting to database...'}
            >
              <span className="pulse-dot"></span>
              <span className="status-label">{serverOnline ? 'Atlas Cloud Live' : 'Connecting...'}</span>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => {
                const next = lang === 'en' ? 'ml' : 'en';
                setLang(next);
                showToast(next === 'ml' ? 'ഭാഷ: മലയാളം' : 'Language: English', 'info');
              }}
              title="Switch Language"
            >
              <span>文A</span>
              <span className="hide-on-mobile">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Light / Dark Mode"
              aria-label="Toggle Theme"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </header>

        {/* Centered Auth Stage (Register / Login / OTP) */}
        <main className="auth-stage-container">
          <div className="auth-wrapper">
            {/* Segmented Switch for Register & Sign In */}
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

        {/* Floating Toast Notification Portal */}
        <div className="toast-portal">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      </div>
    );
  }

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

          <div className="brand-group" onClick={() => setActiveTab('chatbot')}>
            <div className="brand-title">
              <span>Pocket</span><b>Route</b>
            </div>
            <span className="brand-tagline">{t.app_tagline}</span>
          </div>
        </div>

        <div className="navbar-right-controls">
          {/* MongoDB Atlas Live Connection Status */}
          <div className={`server-status-pill ${serverOnline ? 'online' : 'connecting'}`} title={serverOnline ? 'MongoDB Atlas Cluster Connected' : 'Connecting to database...'}>
            <span className="pulse-dot"></span>
            <span className="status-label">{serverOnline ? 'Atlas Cloud Live' : 'Connecting...'}</span>
          </div>

          {/* User Suggestion Button */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setShowFeedbackModal(true)}
            title="Send your suggestions to improve PocketRoute"
          >
            <span>💡</span>
            <span className="hide-on-mobile">Suggest</span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => {
              const next = lang === 'en' ? 'ml' : 'en';
              setLang(next);
              showToast(next === 'ml' ? 'ഭാഷ: മലയാളം' : 'Language: English', 'info');
            }}
            title="Switch Language"
          >
            <span>文A</span>
            <span className="hide-on-mobile">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* User Profile / Auth Avatar */}
          <div
            className="av"
            onClick={() => setActiveTab('auth')}
            title={user ? `${user.name} (${user.email})` : 'Sign in / Create Account'}
            style={{ width: '32px', height: '32px', fontSize: '13px', cursor: 'pointer' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>

          {/* Quick Sign Out Button in Header */}
          <button
            type="button"
            className="nav-signout-btn"
            onClick={handleLogout}
            title="Sign out of PocketRoute"
          >
            <span style={{ fontSize: '13px' }}>🚪</span>
            <span className="hide-on-mobile">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="pocketroute-body-layout">
        
        {/* Left Persistent Sidebar (Collapsible & Mobile Drawer) */}
        <aside className={`pocketroute-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-section-title">MAIN NAVIGATION</div>

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

          <div className="sidebar-section-title" style={{ marginTop: '20px' }}>COMMUNITY & ACCOUNT</div>

          <button
            type="button"
            className="sidebar-nav-btn"
            onClick={() => {
              setShowFeedbackModal(true);
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon">💡</span>
            <span className="snb-label">Suggest Improvements</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('auth');
              setMobileMenuOpen(false);
            }}
          >
            <span className="snb-icon">👤</span>
            <span className="snb-label">{user?.name ? user.name.split(' ')[0] : 'My Profile'}</span>
          </button>

          {/* Dedicated Sign Out Button in Sidebar */}
          <button
            type="button"
            className="sidebar-nav-btn sidebar-signout-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            title="Sign out of PocketRoute"
          >
            <span className="snb-icon">🚪</span>
            <span className="snb-label">Sign Out</span>
          </button>

          <div style={{ flex: 1 }}></div>

          {/* Collapse Sidebar Button on Desktop */}
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

            {/* View 1: Chat-Bot */}
            {activeTab === 'chatbot' && (
              <ChatBotView
                user={user}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* View 2: Plan the Trip */}
            {activeTab === 'plantrip' && (
              <PlanTripView
                user={user}
                onTripCreated={(trip) => {
                  setActiveTab('rearrange');
                  showToast('Trip created! You can now re-order stops.', 'success');
                }}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* View 3: Re-Arrange your Trip */}
            {activeTab === 'rearrange' && (
              <RearrangeTripView
                user={user}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* View 4: My Favorites */}
            {activeTab === 'favorites' && (
              <FavoritesView
                user={user}
                onSelectTrip={(trip) => {
                  setActiveTab('rearrange');
                }}
                onOpenShare={(data) => setShareData(data)}
                showToast={showToast}
              />
            )}

            {/* View 5: Contribute Places */}
            {activeTab === 'contribute' && (
              <ContributePlacesView
                user={user}
                showToast={showToast}
              />
            )}

            {/* View 6: User Account & Profile */}
            {activeTab === 'auth' && (
              <div className="auth-stage-container" style={{ padding: '10px 0' }}>
                <div className="auth-wrapper">
                  <div className="auth-card verified-success-card">
                    <div className="success-check-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <h2 className="auth-card-title">{t.dash_welcome} {user?.name}!</h2>
                    <p className="auth-card-subtitle">
                      {user?.isGuest ? 'Guest Explorer Session' : 'Account verified on MongoDB Atlas Cloud'}
                    </p>

                    <div className="verified-meta-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--mut)' }}>Email</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '500' }}>{user?.email}</span>
                      </div>
                      {user?.mobile && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--mut)' }}>Mobile</span>
                          <span style={{ fontSize: '13.5px', fontWeight: '500' }}>+91 {user.mobile}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: 'var(--mut)' }}>Cloud Database</span>
                        <span style={{ fontSize: '12px', color: 'var(--acc)', fontWeight: '600' }}>
                          pocketroute.cluster0 (Atlas)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-primary-teal"
                      style={{ background: 'var(--bads)', color: 'var(--bad)', border: '1px solid var(--bad)', fontWeight: '700' }}
                      onClick={handleLogout}
                    >
                      🚪 {t.btn_signout}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Bottom Navigation Bar for Mobile Screens (< 768px) */}
      <nav className="mobile-bottom-tabbar" aria-label="Mobile Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mbt-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="mbt-icon">{item.icon}</span>
            <span className="mbt-label">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* Universal Share Modal (ChatGPT-style) */}
      <ShareModal
        isOpen={Boolean(shareData)}
        onClose={() => setShareData(null)}
        shareData={shareData}
        showToast={showToast}
      />

      {/* Feedback & Suggestion Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
        showToast={showToast}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
