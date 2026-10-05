import React, { useState } from 'react';

export default function LoginForm({
  t,
  onLoginSuccess,
  onRequiresOtp,
  onSwitchToRegister,
  onGuestBypass,
  showToast,
  API_BASE,
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!identifier.trim()) newErrors.identifier = 'Please enter your email or mobile';
    if (!password) newErrors.password = 'Please enter your password';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (data.requiresOtp) {
        showToast(data.message || 'OTP verification required', 'warning');
        onRequiresOtp({
          email: data.email,
          mobile: data.mobile,
          name: 'Explorer',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('pocketroute_token', data.token);
      localStorage.setItem('pocketroute_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      onLoginSuccess(data.user);
    } catch (err) {
      setFormError(err.message || 'Invalid credentials. Please try again.');
      showToast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2 className="auth-card-title">{t.login_title}</h2>
        <p className="auth-card-subtitle">{t.login_desc}</p>
      </div>



      {/* Prominent Inline Alert Banner for Errors */}
      {formError && (
        <div className="auth-alert-banner error" role="alert">
          <div className="aab-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <span className="aab-text">{formError}</span>
          <button
            type="button"
            className="aab-close"
            onClick={() => setFormError('')}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Email or Mobile Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-id">
            <span>{t.lbl_login_id} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">✉️</span>
            <input
              id="login-id"
              type="text"
              placeholder="e.g. bibin@example.com or 9876543210"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setFormError('');
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
              }}
              className={`auth-input ${errors.identifier || formError ? 'has-error' : ''}`}
              autoComplete="username"
              required
            />
          </div>
          {errors.identifier && <span className="form-error">{errors.identifier}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="form-label">
            <span>{t.lbl_password} <span className="req-star">*</span></span>
            <button
              type="button"
              className="link-button"
              style={{ fontSize: '12px' }}
              onClick={() => showToast('Password reset link sent to your registered email', 'info')}
            >
              {t.btn_forgot_pass}
            </button>
          </div>
          <div className="input-container">
            <span className="input-icon">🔒</span>
            <input
              id="login-pass"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError('');
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              className={`auth-input ${errors.password || formError ? 'has-error' : ''}`}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-trailing-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          className="btn-primary-teal"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-dot"></span>
              <span>Signing in...</span>
            </>
          ) : (
            t.btn_signin
          )}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>{t.divider_or}</span>
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          className="btn-secondary-mint"
          onClick={onGuestBypass}
        >
          {t.btn_guest}
        </button>
      </form>

      {/* Switch to Register footer */}
      <div className="auth-card-footer">
        <span>{t.note_need_account}</span>
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToRegister}
        >
          {t.btn_create_free}
        </button>
      </div>
    </div>
  );
}
