import React, { useState } from 'react';

export default function RegisterForm({
  t,
  onRegisterSuccess,
  onSwitchToLogin,
  onGuestBypass,
  showToast,
  API_BASE,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', cls: '', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', cls: 'weak', width: '33%' };
    if (score === 2) return { score: 2, label: 'Good', cls: 'medium', width: '66%' };
    return { score: 3, label: 'Strong', cls: 'strong', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFillDemo = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: 'Bibin Varghese',
      email: `bibin_${randomSuffix}@example.com`,
      mobile: '9847012345',
      password: 'password123',
      confirmPassword: 'password123',
    });
    setErrors({});
    setFormError('');
    showToast('Filled test registration details', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: cleanMobile,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      showToast('Account created! Your verification code is 12345', 'success');
      onRegisterSuccess({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: cleanMobile,
      });
    } catch (err) {
      setFormError(err.message || 'Registration failed');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2 className="auth-card-title">{t.reg_title}</h2>
        <p className="auth-card-subtitle">{t.reg_desc}</p>
      </div>

      {/* Quick Demo Pre-fill Pill */}
      <div className="demo-account-pill" style={{ marginBottom: '18px' }}>
        <span>⚡ Quick Test Register:</span>
        <button type="button" className="demo-account-btn" onClick={handleFillDemo}>
          Pre-Fill Sample User
        </button>
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
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">
            <span>{t.lbl_name} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">👤</span>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="e.g. Bibin Varghese"
              value={formData.name}
              onChange={handleChange}
              className={`auth-input ${errors.name ? 'has-error' : ''}`}
              autoComplete="name"
              required
            />
          </div>
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">
            <span>{t.lbl_email} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">✉️</span>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`auth-input ${errors.email ? 'has-error' : ''}`}
              autoComplete="email"
              required
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-mobile">
            <span>{t.lbl_mobile} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">📱</span>
            <input
              id="reg-mobile"
              type="tel"
              name="mobile"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={formData.mobile}
              onChange={handleChange}
              className={`auth-input ${errors.mobile ? 'has-error' : ''}`}
              autoComplete="tel"
              required
            />
          </div>
          {errors.mobile ? (
            <span className="form-error">{errors.mobile}</span>
          ) : (
            <span className="form-hint">{t.hint_mobile}</span>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-pass">
            <span>{t.lbl_password} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">🔒</span>
            <input
              id="reg-pass"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              className={`auth-input ${errors.password ? 'has-error' : ''}`}
              autoComplete="new-password"
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

          {/* Strength Bar */}
          {formData.password && (
            <div className="password-strength-box">
              <div className="strength-bar-track">
                <div
                  className={`strength-bar-fill ${strength.cls}`}
                  style={{ width: strength.width }}
                ></div>
              </div>
              <span className={`strength-text ${strength.cls}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-conf-pass">
            <span>{t.lbl_confirm_password} <span className="req-star">*</span></span>
          </label>
          <div className="input-container">
            <span className="input-icon">🔒</span>
            <input
              id="reg-conf-pass"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`auth-input ${errors.confirmPassword ? 'has-error' : ''}`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="input-trailing-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        {/* Primary Register Button */}
        <button
          type="submit"
          className="btn-primary-teal"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-dot"></span>
              <span>Sending verification code...</span>
            </>
          ) : (
            t.btn_register
          )}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>{t.divider_or}</span>
        </div>

        {/* Guest Mode */}
        <button
          type="button"
          className="btn-secondary-mint"
          onClick={onGuestBypass}
        >
          {t.btn_guest}
        </button>
      </form>

      {/* Switch to Login footer */}
      <div className="auth-card-footer">
        <span>{t.note_already_account}</span>
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToLogin}
        >
          {t.btn_login_link}
        </button>
      </div>
    </div>
  );
}
