import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Contests = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ contestName: '', startDate: '', duration: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchContests = () => {
        api.get('/admin/contests').then(data => {
            setContests(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    };

    useEffect(() => { fetchContests(); }, []);

    const getStatus = (contest) => {
        const now = new Date();
        const start = new Date(contest.startDate);
        const end = new Date(start.getTime() + contest.duration * 60000);
        if (now < start) return { label: 'Upcoming', dot: 'status-upcoming', color: 'var(--yellow)' };
        if (now > end) return { label: 'Ended', dot: 'status-ended', color: 'var(--text3)' };
        return { label: 'Live', dot: 'status-live', color: 'var(--green)' };
    };

    const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/contests', {
                contestName: form.contestName,
                startDate: form.startDate,
                duration: Number(form.duration)
            });
            setMsg('Contest created!');
            setShowModal(false);
            setForm({ contestName: '', startDate: '', duration: '' });
            fetchContests();
            setTimeout(() => setMsg(''), 2500);
        } catch (err) {
            setMsg('Error creating contest');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contest?')) return;
        await api.delete(`/admin/contests/${id}`);
        fetchContests();
    };

    return (
        <div className="fade-in">
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1>🏆 Contests</h1>
                    <p>Manage all coding contests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Create Contest</button>
            </div>

            {msg && <div className="alert alert-success mb-16"><span>✅</span> {msg}</div>}

            {loading ? (
                <div className="text-center" style={{ padding: '60px' }}><span className="spinner" /></div>
            ) : contests.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">🏆</div>
                        <h3>No contests yet</h3>
                        <p>Create your first contest to get started</p>
                        <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>Create Contest</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {contests.map(contest => {
                        const status = getStatus(contest);
                        return (
                            <div key={contest._id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="flex items-center gap-12 mb-8">
                                        <span className={`status-dot ${status.dot}`} />
                                        <h3 style={{ fontSize: '17px', fontWeight: '800' }}>{contest.contestName}</h3>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px',
                                            background: status.label === 'Live' ? 'rgba(61,214,140,0.15)' : status.label === 'Upcoming' ? 'rgba(255,217,61,0.15)' : 'rgba(100,116,139,0.15)',
                                            color: status.color
                                        }}>{status.label}</span>
                                    </div>
                                    <div className="flex gap-24 text-sm text-muted">
                                        <span>🕐 {formatDate(contest.startDate)}</span>
                                        <span>⏱ {contest.duration} min</span>
                                        <span>📋 {contest.problems?.length || 0} problems</span>
                                        <span>👥 {contest.registeredCandidateCnt || 0} registered</span>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/contests/${contest._id}`)}>Manage →</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(contest._id)}>🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ Create Contest</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Contest Name</label>
                                <input type="text" className="form-control" placeholder="e.g. Weekly Challenge #1"
                                    value={form.contestName} onChange={e => setForm({ ...form, contestName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Date & Time</label>
                                <input type="datetime-local" className="form-control"
                                    value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (minutes)</label>
                                <input type="number" className="form-control" placeholder="e.g. 120"
                                    value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
                            </div>
                            <div className="flex gap-8 justify-between">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <span className="spinner" /> : '✨ Create Contest'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contests;
