import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

const RegisteredCandidates = ({ contestId, contest }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('totalScore');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        api.get(`/admin/contests/${contestId}/candidates`).then(data => {
            setCandidates(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [contestId]);

    const totalProblems = contest?.problems?.length || 0;

    const filtered = candidates
        .filter(c => !search || c.username?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'totalScore') return (b.totalScore || 0) - (a.totalScore || 0);
            if (sortBy === 'solved') return (b.solved || 0) - (a.solved || 0);
            if (sortBy === 'submissions') return (b.totalSubmissions || 0) - (a.totalSubmissions || 0);
            if (sortBy === 'penalty') return (a.penalty || 0) - (b.penalty || 0);
            if (sortBy === 'name') return a.username?.localeCompare(b.username);
            return 0;
        });

    const totalRegistered = contest?.registeredCandidateCnt || candidates.length;
    const avgSolved = candidates.length ? (candidates.reduce((s, c) => s + (c.solved || 0), 0) / candidates.length).toFixed(1) : 0;
    const fullSolvers = candidates.filter(c => c.solved >= totalProblems && totalProblems > 0).length;

    const solvedDistribution = Array.from({ length: totalProblems + 1 }, (_, i) => ({
        solved: `${i}/${totalProblems}`,
        count: candidates.filter(c => (c.solved || 0) === i).length
    })).filter(d => d.count > 0);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <span className="spinner" />
        </div>
    );

    return (
        <div className="fade-in">
            <div className="grid-4 mb-20">
                {[
                    { label: 'Registered', value: totalRegistered, color: 'var(--accent)', bg: 'rgba(79,138,255,0.15)', icon: '👥' },
                    { label: 'Avg Solved', value: avgSolved, color: 'var(--green)', bg: 'rgba(61,214,140,0.15)', icon: '📊' },
                    { label: 'Full Solvers', value: fullSolvers, color: 'var(--yellow)', bg: 'rgba(255,217,61,0.12)', icon: '🏆' },
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

            {candidates.length > 0 && solvedDistribution.length > 0 && (
                <div className="card mb-20">
                    <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>🏅 Solved Problems Distribution</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={solvedDistribution} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="solved" tick={{ fontSize: 12, fill: 'var(--text2)' }} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text2)' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                                formatter={(val) => [val, 'Candidates']} />
                            <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="card mb-16" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="form-control" style={{ maxWidth: '240px' }}
                        placeholder="🔍 Search by username..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="form-control" style={{ maxWidth: '200px' }} value={sortBy}
                        onChange={e => setSortBy(e.target.value)}>
                        <option value="totalScore">Sort: Total Score</option>
                        <option value="solved">Sort: Problems Solved</option>
                        <option value="submissions">Sort: Total Submissions</option>
                        <option value="penalty">Sort: Penalty (Low first)</option>
                        <option value="name">Sort: Name A-Z</option>
                    </select>
                    <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
                        {filtered.length} of {candidates.length} candidates
                    </span>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">👥</div>
                        <h3>No candidates found</h3>
                        <p>{candidates.length === 0 ? 'No candidates have registered for this contest yet' : 'Try adjusting your search'}</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px 120px 80px 80px',
                        gap: '12px', padding: '8px 16px',
                        fontSize: '11px', fontWeight: '700', color: 'var(--text3)',
                        textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                        <span>Rank</span>
                        <span>Username</span>
                        <span>Score</span>
                        <span>Solved</span>
                        <span>Submissions</span>
                        <span>Penalty</span>
                        <span>Details</span>
                    </div>

                    {filtered.map((candidate, idx) => {
                        const solvedPct = totalProblems ? Math.round(((candidate.solved || 0) / totalProblems) * 100) : 0;
                        const isExpanded = expandedId === candidate.username;
                        const rankStyle = idx === 0
                            ? { color: '#ffd700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }
                            : idx === 1
                            ? { color: '#c0c0c0', background: 'rgba(192,192,192,0.1)', border: '1px solid rgba(192,192,192,0.2)' }
                            : idx === 2
                            ? { color: '#cd7f32', background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.2)' }
                            : { color: 'var(--text3)', background: 'var(--bg3)', border: '1px solid var(--border)' };

                        return (
                            <div key={candidate.username} className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px 120px 80px 80px',
                                    gap: '12px', padding: '14px 16px', alignItems: 'center', cursor: 'pointer'
                                }} onClick={() => setExpandedId(isExpanded ? null : candidate.username)}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: '800', ...rankStyle
                                    }}>
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                    </div>

                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{candidate.username}</div>

                                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--accent)' }}>
                                        {candidate.totalScore || 0}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-8">
                                            <span style={{ fontWeight: '800', fontSize: '15px', color: candidate.solved > 0 ? 'var(--green)' : 'var(--text3)' }}>
                                                {candidate.solved || 0}
                                            </span>
                                            <span className="text-xs text-muted">/ {totalProblems}</span>
                                        </div>
                                        {totalProblems > 0 && (
                                            <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', marginTop: '5px', width: '80px' }}>
                                                <div style={{
                                                    height: '4px', width: `${solvedPct}%`, borderRadius: '2px',
                                                    background: solvedPct === 100 ? 'var(--green)' : solvedPct > 50 ? 'var(--accent)' : 'var(--yellow)',
                                                    transition: 'width 0.4s ease'
                                                }} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text2)' }}>
                                        {candidate.totalSubmissions || 0}
                                    </div>

                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--orange)' }}>
                                        {candidate.penalty || 0}
                                    </div>

                                    <button className="btn btn-secondary btn-sm"
                                        onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : candidate.username); }}>
                                        {isExpanded ? '▲' : '▼'}
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="fade-in" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg3)', padding: '20px' }}>
                                        <div className="grid-3 gap-16">
                                            <div className="card" style={{ background: 'var(--bg2)' }}>
                                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text2)', marginBottom: '12px' }}>📊 Contest Performance</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {[
                                                        { label: 'Total Score', value: candidate.totalScore || 0, color: 'var(--accent)' },
                                                        { label: 'Problems Solved', value: `${candidate.solved || 0} / ${totalProblems}`, color: 'var(--green)' },
                                                        { label: 'Total Submissions', value: candidate.totalSubmissions || 0, color: 'var(--purple)' },
                                                        { label: 'Penalty', value: candidate.penalty || 0, color: 'var(--orange)' },
                                                        { label: 'Correct Count', value: candidate.correctCnt || 0, color: 'var(--green)' },
                                                    ].map(item => (
                                                        <div key={item.label} className="flex items-center justify-between">
                                                            <span className="text-sm text-muted">{item.label}</span>
                                                            <span style={{ fontWeight: '800', color: item.color }}>{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="card" style={{ background: 'var(--bg2)' }}>
                                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text2)', marginBottom: '12px' }}>📋 Registration Info</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div>
                                                        <span className="text-xs text-muted">Username</span>
                                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{candidate.username}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted">Registered At</span>
                                                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{formatDate(candidate.registeredAt)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted">Rank</span>
                                                        <div style={{ fontWeight: '800', fontSize: '20px', color: 'var(--accent)' }}>#{idx + 1}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card" style={{ background: 'var(--bg2)' }}>
                                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text2)', marginBottom: '12px' }}>🏆 Progress</h4>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 8px',
                                                        background: `conic-gradient(var(--green) ${solvedPct * 3.6}deg, var(--bg3) 0deg)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '60px', height: '60px', borderRadius: '50%',
                                                            background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: '800', fontSize: '16px', color: 'var(--green)'
                                                        }}>
                                                            {solvedPct}%
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted">Completion Rate</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RegisteredCandidates;
