import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import AddChallenge from './AddChallenge';
import Announcements from './Announcements';
import ViewSubmissions from './ViewSubmissions';
import RegisteredCandidates from './RegisteredCandidates';
import PlagDetector from './PlagDetector';

const TABS = [
    { id: 'challenges', icon: '📋', label: 'Challenges' },
    { id: 'announcements', icon: '📢', label: 'Announcements' },
    { id: 'submissions', icon: '📊', label: 'Submissions' },
    { id: 'candidates', icon: '👥', label: 'Candidates' },
    { id: 'plag', icon: '🔍', label: 'Plag Detection' },
];

const ManageContest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('challenges');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const fetchContest = useCallback(() => {
        api.get(`/admin/contests/${id}`).then(data => {
            setContest(data);
            setEditForm({
                contestName: data.contestName,
                startDate: data.startDate ? data.startDate.slice(0, 16) : '',
                duration: data.duration
            });
            setLoading(false);
        });
    }, [id]);

    useEffect(() => { fetchContest(); }, [fetchContest]);

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/contests/${id}`, {
                contestName: editForm.contestName,
                startDate: editForm.startDate,
                duration: Number(editForm.duration)
            });
            setSaveMsg('Contest updated!');
            setEditMode(false);
            fetchContest();
            setTimeout(() => setSaveMsg(''), 2500);
        } catch {
            setSaveMsg('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const getStatus = (c) => {
        if (!c) return {};
        const now = new Date();
        const start = new Date(c.startDate);
        const end = new Date(start.getTime() + c.duration * 60000);
        if (now < start) return { label: 'Upcoming', dot: 'status-upcoming', color: 'var(--yellow)' };
        if (now > end) return { label: 'Ended', dot: 'status-ended', color: 'var(--text3)' };
        return { label: 'Live', dot: 'status-live', color: 'var(--green)' };
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <span className="spinner" />
        </div>
    );
    if (!contest) return (
        <div className="empty-state"><div className="icon">❌</div><h3>Contest not found</h3></div>
    );

    const status = getStatus(contest);

    return (
        <div className="fade-in">
            <div className="flex items-center gap-12 mb-8">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/contests')}>← Back</button>
                <div className="flex items-center gap-8">
                    <span className={`status-dot ${status.dot}`} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: status.color }}>{status.label}</span>
                </div>
            </div>

            <div className="card mb-24" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, right: 0, width: '300px', height: '100%',
                    background: 'radial-gradient(ellipse at right, rgba(79,138,255,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                {!editMode ? (
                    <div>
                        <div className="flex items-center justify-between mb-16">
                            <h1 style={{ fontSize: '26px', fontWeight: '800' }}>{contest.contestName}</h1>
                            <button className="btn btn-secondary" onClick={() => setEditMode(true)}>✏️ Edit Details</button>
                        </div>
                        <div className="flex gap-24" style={{ flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start</span>
                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatDate(contest.startDate)}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</span>
                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{contest.duration} min</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Problems</span>
                                <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--accent)' }}>{contest.problems?.length || 0}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registered</span>
                                <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--purple)' }}>{contest.registeredCandidateCnt || 0}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Announcements</span>
                                <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--yellow)' }}>{contest.announcements?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveEdit}>
                        <div className="flex items-center justify-between mb-16">
                            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>✏️ Edit Contest Details</h2>
                            <div className="flex gap-8">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <span className="spinner" /> : '💾 Save Changes'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contest Name</label>
                            <input className="form-control" value={editForm.contestName}
                                onChange={e => setEditForm({ ...editForm, contestName: e.target.value })} required />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Start Date & Time</label>
                                <input type="datetime-local" className="form-control" value={editForm.startDate}
                                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (minutes)</label>
                                <input type="number" className="form-control" value={editForm.duration}
                                    onChange={e => setEditForm({ ...editForm, duration: e.target.value })} required />
                            </div>
                        </div>
                    </form>
                )}

                {saveMsg && (
                    <div className="alert alert-success mt-16" style={{ margin: '12px 0 0' }}>
                        <span>✅</span> {saveMsg}
                    </div>
                )}
            </div>

            <div className="tabs mb-24">
                {TABS.map(tab => (
                    <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}>
                        <span>{tab.icon}</span>{tab.label}
                    </button>
                ))}
            </div>

            <div className="fade-in" key={activeTab}>
                {activeTab === 'challenges' && <AddChallenge contestId={id} contest={contest} onUpdate={fetchContest} />}
                {activeTab === 'announcements' && <Announcements contestId={id} contest={contest} onUpdate={fetchContest} />}
                {activeTab === 'submissions' && <ViewSubmissions contestId={id} contest={contest} />}
                {activeTab === 'candidates' && <RegisteredCandidates contestId={id} contest={contest} />}
                {activeTab === 'plag' && <PlagDetector contestId={id} contest={contest} />}
            </div>
        </div>
    );
};

export default ManageContest;
