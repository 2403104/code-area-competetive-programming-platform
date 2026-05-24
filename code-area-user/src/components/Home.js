import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [stats, setStats] = useState({ problems: 0, contests: 0 });
  const isLoggedIn = !!localStorage.getItem('auth-token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const [probRes, contestRes] = await Promise.all([
          fetch(`${BACKEND_URL}/problems/get-all-problems`),
          fetch(`${BACKEND_URL}/user/get-all-contest`)
        ]);
        const probData = await probRes.json();
        const contestData = await contestRes.json();
        setStats({
          problems: Array.isArray(probData) ? probData.length : 0,
          contests: contestData.success && Array.isArray(contestData.contests) ? contestData.contests.length : 0
        });
      } catch (err) {
        // silently fail - stats just stay 0
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: '90vh', backgroundColor: '#f8f9fc' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
        color: '#fff',
        padding: '80px 0 70px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
          &lt;/&gt; CodeArea
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.88, marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px' }}>
          Practice competitive programming, compete in contests, and grow your skills.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/problems"
            className="btn btn-light fw-semibold px-4 py-2"
            style={{ borderRadius: '8px', color: '#0d6efd', fontSize: '1rem' }}>
            Browse Problems
          </Link>
          <Link to="/contest"
            className="btn fw-semibold px-4 py-2"
            style={{ borderRadius: '8px', border: '2px solid #fff', color: '#fff', fontSize: '1rem', background: 'transparent' }}>
            View Contests
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="d-flex justify-content-center gap-5 py-4"
        style={{ borderBottom: '1px solid #e2e6ea', background: '#fff' }}>
        <div className="text-center">
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d6efd' }}>{stats.problems}</div>
          <div style={{ fontSize: '0.85rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Problems</div>
        </div>
        <div style={{ width: '1px', background: '#e2e6ea' }} />
        <div className="text-center">
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d6efd' }}>{stats.contests}</div>
          <div style={{ fontSize: '0.85rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contests</div>
        </div>
        <div style={{ width: '1px', background: '#e2e6ea' }} />
        <div className="text-center">
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d6efd' }}>4</div>
          <div style={{ fontSize: '0.85rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Languages</div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🧩</div>
              <h5 className="fw-bold mb-2">Problem Set</h5>
              <p className="text-secondary mb-3" style={{ fontSize: '0.93rem' }}>
                Solve handpicked problems across difficulty levels. Track your accepted submissions.
              </p>
              <Link to="/problems" className="btn btn-outline-primary btn-sm mt-auto" style={{ width: 'fit-content' }}>
                Solve Now
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏆</div>
              <h5 className="fw-bold mb-2">Contests</h5>
              <p className="text-secondary mb-3" style={{ fontSize: '0.93rem' }}>
                Compete live, climb the standings, and earn a rating based on your performance.
              </p>
              <Link to="/contest" className="btn btn-outline-primary btn-sm mt-auto" style={{ width: 'fit-content' }}>
                See Contests
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
              <h5 className="fw-bold mb-2">Discussions</h5>
              <p className="text-secondary mb-3" style={{ fontSize: '0.93rem' }}>
                Ask questions, share approaches, and discuss problems with the community.
              </p>
              <Link to="/discussions" className="btn btn-outline-primary btn-sm mt-auto" style={{ width: 'fit-content' }}>
                Join Discussion
              </Link>
            </div>
          </div>
        </div>

        {/* CTA for logged-out users */}
        {!isLoggedIn && (
          <div className="text-center mt-5 p-4" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e6ea' }}>
            <h5 className="fw-bold mb-2">Ready to start?</h5>
            <p className="text-secondary mb-3">Create an account to save submissions, earn ratings, and join contests.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/auth/codearea-signup" className="btn btn-primary px-4">Create Account</Link>
              <Link to="/auth/codearea-login" className="btn btn-outline-secondary px-4">Login</Link>
            </div>
          </div>
        )}

        {/* CTA for logged-in users */}
        {isLoggedIn && (
          <div className="text-center mt-5 p-4" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e6ea' }}>
            <h5 className="fw-bold mb-2">Welcome back, {username}!</h5>
            <p className="text-secondary mb-3">Check your profile to see your progress and contest history.</p>
            <Link to={`/code-area/profile/${username}`} className="btn btn-primary px-4">View Profile</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
