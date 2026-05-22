import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';

const LoginPage = () => {
  const context = useContext(ProblemContext);
  const navigate = useNavigate();
  const { subList, setSubList, setUsername } = context;
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const HandleLogin = async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const url = `${BACKEND_URL}/auth/codearea-login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });
    const json = await response.json();
    if (json.success) {
      localStorage.setItem('username', credentials.username);
      localStorage.setItem('auth-token', json.authToken);
      const getUserUrl = `${BACKEND_URL}/auth/codearea-getuser`;
      const userGetRes = await fetch(getUserUrl, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'auth-token': json.authToken
        }
      });
      const userData = await userGetRes.json();
      setSubList(userData.submissionList);
      navigate('/');
    } else {
      alert(json.error);
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  }

  return (
    <div className="d-flex align-items-center" style={{ marginLeft: '35vw', marginTop: '4vw' }}>
      <div className="card p-4" style={{ width: '30vw', height: '40vw', backgroundColor: '#f9f9f9', border: '1px solid #d3d3d3', borderRadius: '12px' }}>
        <h4 className="text-center mb-4 fw-bold" style={{ color: '#334155', letterSpacing: '1px', fontSize: '1.5rem' }}>
          CodeArea Login
        </h4>

        <div className="mb-3">
          <label className="form-label text-secondary small">Username or Email</label>
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

        <button
          onClick={HandleLogin}
          className="btn w-100"
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            fontWeight: '500',
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}
        >
          Sign In
        </button>

        <div className="d-flex justify-content-between mt-3">
          <Link to="/" className="small text-decoration-none text-primary fw-semibold" style={{fontSize:'1.0rem'}}>Forgot Password?</Link>
          <Link to="/auth/codearea-signup" className="small text-decoration-none text-primary fw-semibold" style={{fontSize:'1.0rem'}}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
