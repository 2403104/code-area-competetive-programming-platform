import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const HandleSignup = async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const url = `${BACKEND_URL}/auth/codearea-signup`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword
      })
    });

    const json = await response.json();
    if (json.success) {
      alert("Account created!");
      navigate('/');
    } else {
      alert(json.error);
    }
  };

  return (
    <div className="d-flex align-items-center" style={{ marginLeft: '35vw', marginTop: '4vw' }}>
      <div className="card p-4" style={{ width: '30vw', height: '40vw', backgroundColor: '#f9f9f9', border: '1px solid #d3d3d3', borderRadius: '12px' }}>
        <h4 className="text-center mb-4 fw-bold" style={{ color: '#334155', letterSpacing: '1px', fontSize: '1.5rem' }}>
          CodeArea SignUp
        </h4>

        <div className="mb-3">
          <label className="form-label text-secondary small">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            onChange={onChange}
            value={credentials.username}
            style={{ fontSize: '0.9rem', padding: '10px' }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary small">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            onChange={onChange}
            value={credentials.email}
            style={{ fontSize: '0.9rem', padding: '10px' }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary small">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            onChange={onChange}
            value={credentials.password}
            style={{ fontSize: '0.9rem', padding: '10px' }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary small">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            onChange={onChange}
            value={credentials.confirmPassword}
            style={{ fontSize: '0.9rem', padding: '10px' }}
          />
        </div>

        <button
          onClick={HandleSignup}
          className="btn w-100"
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            fontWeight: '500',
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}
        >
          Sign Up
        </button>

        <div className="d-flex justify-content-between mt-3">
          <Link to="/auth/codearea-login" className="small text-decoration-none text-primary fw-semibold" style={{fontSize:'1.0rem'}}>Already have an account?</Link>
          <Link to="/auth/codearea-login" className="small text-decoration-none text-primary fw-semibold" style={{fontSize:'1.0rem'}}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
