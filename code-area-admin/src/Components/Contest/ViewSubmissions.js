import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

const VERDICT_META = {
    AC:  { label: 'Accepted',      color: '#3dd68c', bg: 'rgba(61,214,140,0.12)',  icon: '✅' },
    WA:  { label: 'Wrong Answer',  color: '#ff5757', bg: 'rgba(255,87,87,0.12)',   icon: '❌' },
    TLE: { label: 'Time Limit',    color: '#ff8c42', bg: 'rgba(255,140,66,0.12)',  icon: '⏱️' },
    MLE: { label: 'Memory Limit',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '💾' },
    RE:  { label: 'Runtime Error', color: '#ffd93d', bg: 'rgba(255,217,61,0.12)',  icon: '💥' },
    CE:  { label: 'Compile Error', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: '🔧' },
};

const LANG_COLORS = { 'C++': '#4f8aff', 'Python': '#ffd93d', 'Java': '#ff8c42', 'JavaScript': '#3dd68c' };

const ViewSubmissions = ({ contestId, contest }) => {
    const [submissions, setSubmissions] = useState([]);   // raw: [ { username, mySubmissions[] } ]
    const [loading, setLoading]         = useState(true);
    const [filter, setFilter]           = useState({ verdict: 'all', problem: 'all', search: '' });
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => {
        api.get(`/admin/contests/${contestId}/submissions`)
            .then(data => {
                setSubmissions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [contestId]);

    const problems = contest?.problems || [];

    const getProblemTitle = (problemId) => {
        const p = problems.find(pr => pr._id.toString() === problemId?.toString());
        return p ? p.title : problemId;
    };

    // Flatten [ { username, mySubmissions[] } ] → [ { ...sub, username } ]
    const allFlat = useMemo(() =>
        submissions.flatMap(entry =>
            (entry.mySubmissions || []).map(sub => ({ ...sub, username: entry.username }))
        ),
    [submissions]);

    const total = allFlat.length;

    const verdictCounts = useMemo(() =>
        Object.keys(VERDICT_META).reduce((acc, v) => {
            acc[v] = allFlat.filter(s => s.status === v).length;
            return acc;
        }, {}),
    [allFlat]);

    const acRate = total ? Math.round((verdictCounts.AC / total) * 100) : 0;

    const pieData = Object.entries(verdictCounts)
        .filter(([, count]) => count > 0)
        .map(([verdict, count]) => ({ name: verdict, value: count, color: VERDICT_META[verdict].color }));

    const barData = useMemo(() => {
        const problemMap = {};
        allFlat.forEach(s => {
            const key = (getProblemTitle(s.problemId) || 'Unknown').substring(0, 18);
            if (!problemMap[key]) problemMap[key] = { name: key, AC: 0, WA: 0, TLE: 0, other: 0 };
            if      (s.status === 'AC')  problemMap[key].AC++;
            else if (s.status === 'WA')  problemMap[key].WA++;
            else if (s.status === 'TLE') problemMap[key].TLE++;
            else                         problemMap[key].other++;
        });
        return Object.values(problemMap);
    }, [allFlat]);

    const uniqueProblemIds = useMemo(() =>
        [...new Set(allFlat.map(s => s.problemId).filter(Boolean))],
    [allFlat]);

    const filtered = useMemo(() =>
        allFlat.filter(s => {
            if (filter.verdict !== 'all' && s.status !== filter.verdict) return false;
            if (filter.problem !== 'all' && s.problemId?.toString() !== filter.problem) return false;
            if (filter.search) {
                const q = filter.search.toLowerCase();
                if (!s.username?.toLowerCase().includes(q) &&
                    !getProblemTitle(s.problemId)?.toLowerCase().includes(q)) return false;
            }
            return true;
        }),
    [allFlat, filter]);

    const formatTime = (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <span className="spinner" />
        </div>
    );

    return (
        <div className="fade-in">
            {/* ── stats ── */}
            <div className="grid-4 mb-20">
                {[
                    { label: 'Total',        value: total,             color: 'var(--accent)', bg: 'rgba(79,138,255,0.15)',  icon: '📊' },
                    { label: 'Accepted',     value: verdictCounts.AC,  color: 'var(--green)',  bg: 'rgba(61,214,140,0.15)', icon: '✅' },
                    { label: 'AC Rate',      value: `${acRate}%`,      color: acRate > 50 ? 'var(--green)' : 'var(--yellow)', bg: 'rgba(255,217,61,0.1)', icon: '📈' },
                    { label: 'Wrong Answer', value: verdictCounts.WA,  color: 'var(--red)',    bg: 'rgba(255,87,87,0.12)',  icon: '❌' },
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

            {/* ── charts ── */}
            {total > 0 && (
                <div className="grid-2 mb-20">
                    <div className="card">
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Verdict Distribution</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <ResponsiveContainer width="50%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1 }}>
                                {pieData.map(entry => (
                                    <div key={entry.name} className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-8">
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '12px', fontWeight: '600' }}>{VERDICT_META[entry.name]?.label || entry.name}</span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: entry.color }}>{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Submissions per Problem</h3>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Bar dataKey="AC"    stackId="a" fill="#3dd68c" />
                                    <Bar dataKey="WA"    stackId="a" fill="#ff5757" />
                                    <Bar dataKey="TLE"   stackId="a" fill="#ff8c42" />
                                    <Bar dataKey="other" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-muted" style={{ padding: '40px 0', fontSize: '14px' }}>No data</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── filters ── */}
            <div className="card mb-16" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="form-control" style={{ maxWidth: '220px' }}
                        placeholder="🔍 Search user / problem..."
                        value={filter.search}
                        onChange={e => setFilter({ ...filter, search: e.target.value })} />
                    <select className="form-control" style={{ maxWidth: '160px' }}
                        value={filter.verdict}
                        onChange={e => setFilter({ ...filter, verdict: e.target.value })}>
                        <option value="all">All Verdicts</option>
                        {Object.entries(VERDICT_META).map(([v, m]) => (
                            <option key={v} value={v}>{m.icon} {m.label}</option>
                        ))}
                    </select>
                    <select className="form-control" style={{ maxWidth: '200px' }}
                        value={filter.problem}
                        onChange={e => setFilter({ ...filter, problem: e.target.value })}>
                        <option value="all">All Problems</option>
                        {uniqueProblemIds.map(pid => (
                            <option key={pid} value={pid}>{getProblemTitle(pid)}</option>
                        ))}
                    </select>
                    <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
                        Showing {filtered.length} of {total}
                    </span>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">📊</div>
                        <h3>No submissions found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User</th>
                                    <th>Problem</th>
                                    <th>Verdict</th>
                                    <th>Language</th>
                                    <th>Time</th>
                                    <th>Error</th>
                                    <th>Submitted</th>
                                    <th>Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sub, i) => {
                                    const vm = VERDICT_META[sub.status] || { label: sub.status, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: '❓' };
                                    const lang       = sub.code?.[0]?.language   || '—';
                                    const sourceCode = sub.code?.[0]?.sourceCode || '';
                                    const rowId      = sub._id || i;
                                    const isExpanded = expandedId === rowId;

                                    return (
                                        <React.Fragment key={rowId}>
                                            <tr>
                                                <td className="text-muted text-sm">{filtered.length - i}</td>
                                                <td style={{ fontWeight: '700' }}>{sub.username || '—'}</td>
                                                <td style={{ fontWeight: '600', maxWidth: '160px' }}>
                                                    {getProblemTitle(sub.problemId)}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                        padding: '4px 10px', borderRadius: '20px',
                                                        background: vm.bg, color: vm.color,
                                                        fontSize: '12px', fontWeight: '700',
                                                        border: `1px solid ${vm.color}33`
                                                    }}>
                                                        {vm.icon} {sub.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '6px',
                                                        fontSize: '12px', fontWeight: '600',
                                                        background: `${LANG_COLORS[lang] || 'var(--border)'}22`,
                                                        color: LANG_COLORS[lang] || 'var(--text2)',
                                                    }}>
                                                        {lang}
                                                    </span>
                                                </td>
                                                <td className="text-sm font-mono">
                                                    {sub.time ? `${sub.time}ms` : '—'}
                                                </td>
                                                <td className="text-sm" style={{
                                                    color: 'var(--red)', maxWidth: '140px',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                }}>
                                                    {sub.errType || '—'}
                                                </td>
                                                <td className="text-xs text-muted">
                                                    {formatTime(sub.submissionTime)}
                                                </td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm"
                                                        onClick={() => setExpandedId(isExpanded ? null : rowId)}>
                                                        {isExpanded ? '▲' : '▼'} Code
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={9} style={{ background: 'var(--bg3)', padding: 0 }}>
                                                        <div style={{ padding: '16px 20px' }}>
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div>
                                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text2)' }}>
                                                                        {lang} · {sub.username}
                                                                    </span>
                                                                    {sub.errType && (
                                                                        <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--red)' }}>
                                                                            {sub.errType}: {sub.errMessage}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button className="btn btn-secondary btn-sm"
                                                                    onClick={() => setExpandedId(null)}>
                                                                    ✕ Close
                                                                </button>
                                                            </div>

                                                            <pre className="font-mono" style={{
                                                                background: 'var(--bg)', padding: '16px',
                                                                borderRadius: 'var(--radius)',
                                                                border: '1px solid var(--border)',
                                                                fontSize: '13px', lineHeight: '1.6',
                                                                overflow: 'auto', maxHeight: '400px',
                                                                color: 'var(--text)', margin: 0
                                                            }}>
                                                                {sourceCode || '// No code available'}
                                                            </pre>

                                                            {sub.verdicts?.length > 0 && (
                                                                <div style={{ marginTop: '12px' }}>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                                                                        Test Case Results
                                                                    </h4>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                        {sub.verdicts.map((v, vi) => (
                                                                            <div key={vi} style={{
                                                                                display: 'grid',
                                                                                gridTemplateColumns: '1fr 1fr 1fr 80px 80px',
                                                                                gap: '8px', padding: '8px 12px',
                                                                                background: 'var(--bg)',
                                                                                borderRadius: 'var(--radius)',
                                                                                border: '1px solid var(--border)',
                                                                                fontSize: '12px'
                                                                            }}>
                                                                                <div><span className="text-muted">Input: </span><span className="font-mono">{v.Input}</span></div>
                                                                                <div><span className="text-muted">Output: </span><span className="font-mono">{v.Output}</span></div>
                                                                                <div><span className="text-muted">Expected: </span><span className="font-mono">{v.Expected}</span></div>
                                                                                <div style={{ color: v.Verdict === 'AC' ? 'var(--green)' : 'var(--red)', fontWeight: '700' }}>
                                                                                    {v.Verdict}
                                                                                </div>
                                                                                <div className="text-muted">{v.time}ms</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewSubmissions;