import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import api from '../../api';

const Dashboard = () => {
    const { adminUser } = useAuth();
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/contests').then(data => {
            setContests(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const now = new Date();

    const getStatus = (contest) => {
        const start = new Date(contest.startDate);
        const end = new Date(start.getTime() + contest.duration * 60000);
        if (now < start) return { label: 'Upcoming', dot: 'status-upcoming', color: 'var(--yellow)' };
        if (now > end) return { label: 'Ended', dot: 'status-ended', color: 'var(--text3)' };
        return { label: 'Live', dot: 'status-live', color: 'var(--green)' };
    };

    const liveContests = contests.filter(c => getStatus(c).label === 'Live');
    const upcomingContests = contests.filter(c => getStatus(c).label === 'Upcoming');
    const totalProblems = contests.reduce((sum, c) => sum + (c.problems?.length || 0), 0);

    const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>👋 Welcome back, {adminUser?.username || 'Admin'}</h1>
                    <p>Here's what's happening on CodeArea today</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/contests')}>➕ New Contest</button>
            </div>

            <div className="grid-4 mb-24">
                {[
                    { label: 'Total Contests', value: contests.length, color: 'var(--accent)', bg: 'rgba(79,138,255,0.15)', icon: '🏆' },
                    { label: 'Live Now', value: liveContests.length, color: 'var(--green)', bg: 'rgba(61,214,140,0.15)', icon: '🟢' },
                    { label: 'Upcoming', value: upcomingContests.length, color: 'var(--yellow)', bg: 'rgba(255,217,61,0.15)', icon: '⏳' },
                    { label: 'Total Problems', value: totalProblems, color: 'var(--purple)', bg: 'rgba(167,139,250,0.15)', icon: '📋' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                        <div className="stat-info">
                            <h3 style={{ color: s.color }}>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-16">
                    <h2 style={{ fontSize: '18px', fontWeight: '800' }}>📅 Contest History</h2>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/contests')}>View All →</button>
                </div>

                {loading ? (
                    <div className="text-center" style={{ padding: '40px' }}>
                        <span className="spinner" />
                    </div>
                ) : contests.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🏆</div>
                        <h3>No contests yet</h3>
                        <p>Create your first contest to get started</p>
                        <button className="btn btn-primary mt-16" onClick={() => navigate('/contests')}>Create Contest</button>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Contest Name</th>
                                    <th>Status</th>
                                    <th>Start Time</th>
                                    <th>Duration</th>
                                    <th>Problems</th>
                                    <th>Registered</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contests.map(contest => {
                                    const status = getStatus(contest);
                                    return (
                                        <tr key={contest._id}>
                                            <td style={{ fontWeight: '700' }}>{contest.contestName}</td>
                                            <td>
                                                <div className="flex items-center gap-8">
                                                    <span className={`status-dot ${status.dot}`} />
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: status.color }}>{status.label}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm text-muted">{formatDate(contest.startDate)}</td>
                                            <td className="text-sm">{contest.duration} min</td>
                                            <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{contest.problems?.length || 0}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--purple)' }}>{contest.registeredCandidateCnt || 0}</td>
                                            <td>
                                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/contests/${contest._id}`)}>
                                                    Manage →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
