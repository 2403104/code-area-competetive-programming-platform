import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BASE_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003').replace(/\/$/, '');

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/admin/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('AdminUser registered successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none'
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
        <div className="text-center mb-24">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            CodeArea
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: '4px', fontSize: '14px' }}>Create an AdminUser account</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Create Account</h2>

          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" placeholder="adminuser" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="admin@codearea.io" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}
              style={{ justifyContent: 'center', marginTop: '8px' }}>
              {loading ? <span className="spinner" /> : '✨ Register AdminUser'}
            </button>
          </form>

          <div className="text-center mt-16" style={{ fontSize: '14px', color: 'var(--text2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
