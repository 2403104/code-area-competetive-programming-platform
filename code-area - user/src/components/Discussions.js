import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const avatarColor = (username) => {
  const colors = ['#4f46e5','#0891b2','#059669','#dc2626','#d97706','#7c3aed','#db2777'];
  let hash = 0;
  for (let c of (username || '?')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ username, size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: avatarColor(username),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: size * 0.4,
    flexShrink: 0, userSelect: 'none'
  }}>
    {(username || '?')[0].toUpperCase()}
  </div>
);

const DiscussionCard = ({ disc, index }) => {
  const [expanded, setExpanded] = useState(false);
  const message = disc.message || '';
  const isLong = message.length > 220;

  return (
    <div
      className="disc-card"
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8ecf0',
        padding: '24px 28px',
        transition: 'box-shadow 0.2s, transform 0.2s',
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.10)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <Avatar username={disc.username} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.97rem' }}>{disc.username}</span>
            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{timeAgo(disc.createdAt)}</span>
          </div>
          <h6 style={{ fontWeight: 700, color: '#2d3748', marginBottom: '8px', fontSize: '1.07rem', lineHeight: 1.4 }}>
            {disc.title || ''}
          </h6>
          <p style={{
            color: '#4a5568', fontSize: '0.93rem', lineHeight: 1.7,
            marginBottom: isLong && !expanded ? '4px' : '0',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
          }}>
            {isLong && !expanded ? message.slice(0, 220) + '…' : message}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: '#4f46e5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const isLoggedIn = !!localStorage.getItem('auth-token');

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/discussions/get-all-discussions`);
      const data = await res.json();
      if (data.success) setDiscussions(data.discussions);
      else setError('Failed to load discussions.');
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDiscussions(); }, [fetchDiscussions]);

  const handleSubmit = async () => {
    setPostError('');
    setPostSuccess('');
    if (!form.title.trim()) { setPostError('Title is required.'); return; }
    if (!form.message.trim()) { setPostError('Message is required.'); return; }
    setPosting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/discussions/create-discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setPostSuccess('Discussion posted!');
        setForm({ title: '', message: '' });
        setShowForm(false);
        fetchDiscussions();
      } else {
        setPostError(data.error || 'Failed to post.');
      }
    } catch {
      setPostError('Could not reach the server.');
    }
    setPosting(false);
  };

  const filtered = discussions.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.title || '').toLowerCase().includes(q) ||
      (d.username || '').toLowerCase().includes(q) ||
      (d.message || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .disc-card { animation: fadeUp 0.4s ease both; }
        .disc-hero-bg {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #0891b2 100%);
        }
        .disc-search:focus { outline: none; box-shadow: 0 0 0 3px rgba(79,70,229,0.18); }
        .disc-textarea:focus { outline: none; box-shadow: 0 0 0 3px rgba(79,70,229,0.18); border-color: #4f46e5 !important; }
        .disc-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(79,70,229,0.18); border-color: #4f46e5 !important; }
        .post-btn:hover { background: #4338ca !important; }
        .cancel-btn:hover { background: #f3f4f6 !important; }
      `}</style>

      {/* Hero */}
      <div className="disc-hero-bg" style={{ padding: '56px 0 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'260px', height:'260px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', bottom:'-80px', right:'-40px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.15)', borderRadius:'999px', padding:'6px 18px', marginBottom:'18px', backdropFilter:'blur(8px)' }}>
            <span style={{ fontSize:'1.1rem' }}>💬</span>
            <span style={{ color:'#fff', fontSize:'0.85rem', fontWeight:600, letterSpacing:'0.5px' }}>COMMUNITY DISCUSSIONS</span>
          </div>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:'2.6rem', marginBottom:'10px', letterSpacing:'-1px' }}>
            Ask. Share. Learn.
          </h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'1.05rem', maxWidth:'480px', margin:'0 auto 30px' }}>
            Discuss problems, share approaches, or ask anything about competitive programming.
          </p>

          <div style={{ maxWidth:'480px', margin:'0 auto', position:'relative' }}>
            <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', pointerEvents:'none' }}>🔍</span>
            <input
              className="disc-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search discussions..."
              style={{
                width:'100%', padding:'13px 16px 13px 44px',
                borderRadius:'12px', border:'none',
                fontSize:'1rem', background:'rgba(255,255,255,0.95)',
                transition:'box-shadow 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ background:'#f7f8fc', minHeight:'60vh', padding:'36px 0 60px' }}>
        <div style={{ maxWidth:'780px', margin:'0 auto', padding:'0 16px' }}>

          {postSuccess && (
            <div style={{ background:'#ecfdf5', border:'1px solid #6ee7b7', borderRadius:'10px', padding:'12px 18px', marginBottom:'16px', color:'#065f46', fontWeight:600, display:'flex', justifyContent:'space-between' }}>
              ✅ {postSuccess}
              <button onClick={() => setPostSuccess('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#065f46' }}>✕</button>
            </div>
          )}

          {!showForm ? (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div style={{ color:'#6b7280', fontWeight:500, fontSize:'0.95rem' }}>
                {!loading && `${filtered.length} discussion${filtered.length !== 1 ? 's' : ''}`}
              </div>
              {isLoggedIn ? (
                <button
                  className="post-btn"
                  onClick={() => { setShowForm(true); setPostError(''); }}
                  style={{
                    background:'#4f46e5', color:'#fff', border:'none',
                    borderRadius:'10px', padding:'10px 22px',
                    fontWeight:700, fontSize:'0.95rem', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:'8px',
                    transition:'background 0.2s'
                  }}
                >
                  <span style={{ fontSize:'1.1rem' }}>+</span> New Discussion
                </button>
              ) : (
                <Link to="/auth/codearea-login"
                  style={{
                    background:'#4f46e5', color:'#fff', textDecoration:'none',
                    borderRadius:'10px', padding:'10px 22px',
                    fontWeight:700, fontSize:'0.95rem',
                    display:'inline-flex', alignItems:'center', gap:'8px'
                  }}
                >
                  Login to Post
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              background:'#fff', borderRadius:'18px', border:'1px solid #e0e7ff',
              padding:'28px', marginBottom:'28px',
              boxShadow:'0 4px 24px rgba(79,70,229,0.10)'
            }}>
              <h5 style={{ fontWeight:800, color:'#1a1a2e', marginBottom:'20px', fontSize:'1.1rem' }}>
                💬 Start a Discussion
              </h5>

              {postError && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', color:'#dc2626', fontSize:'0.9rem' }}>
                  {postError}
                </div>
              )}

              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', marginBottom:'6px', fontSize:'0.9rem' }}>Title</label>
                <input
                  className="disc-input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="What's your topic?"
                  maxLength={120}
                  style={{
                    width:'100%', padding:'11px 14px', borderRadius:'10px',
                    border:'1.5px solid #e2e8f0', fontSize:'0.97rem',
                    transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom:'18px' }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', marginBottom:'6px', fontSize:'0.9rem' }}>Message</label>
                <textarea
                  className="disc-textarea"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Share your thoughts, ask a question..."
                  rows={5}
                  style={{
                    width:'100%', padding:'11px 14px', borderRadius:'10px',
                    border:'1.5px solid #e2e8f0', fontSize:'0.95rem', resize:'vertical',
                    transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box',
                    lineHeight: 1.6
                  }}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="cancel-btn"
                  onClick={() => { setShowForm(false); setPostError(''); setForm({ title:'', message:'' }); }}
                  style={{
                    background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:'10px',
                    padding:'10px 20px', fontWeight:600, cursor:'pointer',
                    color:'#374151', transition:'background 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="post-btn"
                  onClick={handleSubmit}
                  disabled={posting}
                  style={{
                    background:'#4f46e5', color:'#fff', border:'none',
                    borderRadius:'10px', padding:'10px 28px',
                    fontWeight:700, cursor: posting ? 'not-allowed' : 'pointer',
                    opacity: posting ? 0.7 : 1, transition:'background 0.2s'
                  }}
                >
                  {posting ? 'Posting…' : 'Post Discussion'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ display:'inline-block', width:'42px', height:'42px', border:'4px solid #e0e7ff', borderTopColor:'#4f46e5', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color:'#a0aec0', marginTop:'14px' }}>Loading discussions…</p>
            </div>
          ) : error ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#dc2626' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>⚠️</div>
              <p>{error}</p>
              <button onClick={fetchDiscussions} style={{ background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 20px', cursor:'pointer', fontWeight:600 }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:'14px' }}>{search ? '🔍' : '🌱'}</div>
              <h5 style={{ color:'#374151', fontWeight:700 }}>{search ? 'No results found' : 'No discussions yet'}</h5>
              <p style={{ color:'#9ca3af', marginBottom:'0' }}>
                {search ? 'Try a different keyword.' : 'Be the first to start a conversation!'}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map((disc, i) => (
                <DiscussionCard key={disc._id} disc={disc} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Discussions;