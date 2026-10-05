import React, { useState, useEffect, useRef } from 'react';

export default function OtpVerification({
  t,
  pendingUser,
  onVerifySuccess,
  onBackToRegister,
  showToast,
  API_BASE,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for OTP
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Focus first digit box on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleDigitChange = (index, val) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setErrorMsg('');

    if (clean && index < 4) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 5);
    const newDigits = ['', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    if (pasted.length === 5) {
      inputRefs[4].current.focus();
    } else if (pasted.length > 0) {
      inputRefs[pasted.length].current.focus();
    }
  };

  const handleAutoFillDemo = () => {
    setDigits(['1', '2', '3', '4', '5']);
    inputRefs[4].current.focus();
    showToast('Auto-filled test OTP: 12345', 'info');
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: pendingUser?.email || pendingUser?.mobile }),
      });
      const data = await res.json();
      showToast(data.message || 'OTP resent: 12345', 'info');
      setSecondsLeft(30);
    } catch (e) {
      showToast('Error resending OTP', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length !== 5) {
      setErrorMsg('Please enter all 5 digits of your verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: pendingUser?.email || pendingUser?.mobile,
          otp: fullOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      localStorage.setItem('pocketroute_token', data.token);
      localStorage.setItem('pocketroute_user', JSON.stringify(data.user));

      showToast('Account successfully verified! Welcome to PocketRoute.', 'success');
      onVerifySuccess(data.user);
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <div className="otp-badge">
          <span>🔒</span>
          <span>{t.otp_badge}</span>
        </div>
        <h2 className="auth-card-title">{t.otp_title}</h2>
        <p className="auth-card-subtitle">
          {t.otp_desc}{' '}
          <b style={{ color: 'var(--ink)' }}>{pendingUser?.email || pendingUser?.mobile}</b>
        </p>
      </div>

      {/* Demo Callout */}
      <div className="otp-demo-callout">
        <div>
          <span>{t.otp_demo_pill} </span>
          <b style={{ letterSpacing: '2px', fontSize: '14px' }}>12345</b>
        </div>
        <button
          type="button"
          className="demo-account-btn"
          onClick={handleAutoFillDemo}
        >
          {t.btn_fill_otp}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* 5 Digit Boxes */}
        <div className="otp-boxes-row" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="otp-box-digit"
              autoComplete="off"
            />
          ))}
        </div>

        {errorMsg && (
          <div className="form-error" style={{ textAlign: 'center', marginBottom: '10px' }}>
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary-teal"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-dot"></span>
              <span>Verifying...</span>
            </>
          ) : (
            t.btn_verify
          )}
        </button>

        {/* Resend & Timer */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--mut)' }}>
          {secondsLeft > 0 ? (
            <span>
              {t.timer_resend_in} <b style={{ color: 'var(--ink)' }}>{secondsLeft}s</b>
            </span>
          ) : (
            <button
              type="button"
              className="link-button"
              onClick={handleResendOtp}
            >
              {t.btn_resend}
            </button>
          )}
        </div>

        {/* Back to register */}
        <div style={{ textAlign: 'center', marginTop: '6px' }}>
          <button
            type="button"
            className="link-button"
            style={{ color: 'var(--mut)', fontSize: '12.5px' }}
            onClick={onBackToRegister}
          >
            ← {t.btn_back_reg}
          </button>
        </div>
      </form>
    </div>
  );
}
