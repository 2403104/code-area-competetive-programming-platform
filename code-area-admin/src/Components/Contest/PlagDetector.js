import React, { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3003";

const PlagDetector = ({ contestId, contest }) => {
    const problems = contest?.problems || [];
    const [results, setResults] = useState({});
    const [running, setRunning] = useState({});
    const [expanded, setExpanded] = useState({});
    const [codeVisible, setCodeVisible] = useState({});

    const runDetection = async (problemId) => {
        setRunning(prev => ({ ...prev, [problemId]: true }));
        setResults(prev => ({ ...prev, [problemId]: null }));
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${BACKEND_URL}/admin/contests/${contestId}/${problemId}/check-plag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, [problemId]: data }));
        } catch (err) {
            setResults(prev => ({
                ...prev,
                [problemId]: { status: 'error', message: err.message, reports: [] }
            }));
        } finally {
            setRunning(prev => ({ ...prev, [problemId]: false }));
        }
    };

    const toggleCode = (key) => {
        setCodeVisible(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getSimilarityColor = (pct) => {
      if(pct >= 99) return '#ff1212';
        if (pct >= 80) return '#ff5757';
        if (pct >= 50) return '#ff8c42';
        if (pct >= 30) return '#ffd93d';
        return '#3dd68c';
    };

    const getDiffBadge = (diff) => {
        const map = { Easy: '#3dd68c', Medium: '#ffd93d', Hard: '#ff5757' };
        return map[diff] || '#94a3b8';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
                padding: '14px 18px', background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.25)', borderRadius: '10px',
                fontSize: '13px', color: 'var(--text2)'
            }}>
                <strong style={{ color: 'var(--purple)' }}>🔍 Plagiarism Detection</strong> — Runs per problem on accepted submissions only. Uses Dolos engine.
            </div>

            {problems.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <h3>No problems in this contest</h3>
                        <p>Add challenges first to run plag detection.</p>
                    </div>
                </div>
            ) : (
                problems.map((prob, idx) => {
                    const result = results[prob._id];
                    const isRunning = running[prob._id];
                    const isExpanded = expanded[prob._id];

                    return (
                        <div key={prob._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Problem header */}
                            <div style={{
                                padding: '16px 20px', display: 'flex',
                                alignItems: 'center', gap: '14px',
                                borderBottom: isExpanded && result ? '1px solid var(--border)' : 'none'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'var(--bg3)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '800', color: 'var(--accent)', flexShrink: 0, fontSize: '14px'
                                }}>
                                    {String.fromCharCode(65 + idx)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{prob.title}</span>
                                        <span style={{
                                            fontSize: '11px', padding: '1px 8px', borderRadius: '20px',
                                            background: `${getDiffBadge(prob.difficulty)}22`,
                                            color: getDiffBadge(prob.difficulty),
                                            border: `1px solid ${getDiffBadge(prob.difficulty)}44`,
                                            fontWeight: '700'
                                        }}>{prob.difficulty}</span>
                                    </div>
                                    {result && result.status === 'success' && (
                                        <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '3px' }}>
                                            {result.totalAcceptedChecked} accepted submissions checked · {result.reports.length} pairs found
                                        </div>
                                    )}
                                    {result && result.status === 'skipped' && (
                                        <div style={{ fontSize: '12px', color: 'var(--yellow)', marginTop: '3px' }}>
                                            ⚠️ {result.message}
                                        </div>
                                    )}
                                    {result && result.status === 'error' && (
                                        <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '3px' }}>
                                            ❌ {result.message}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {result && result.status === 'success' && result.reports.length > 0 && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setExpanded(prev => ({ ...prev, [prob._id]: !isExpanded }))}
                                        >
                                            {isExpanded ? '▲ Hide' : `▼ View ${result.reports.length} pairs`}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            background: 'rgba(167,139,250,0.12)',
                                            color: 'var(--purple)',
                                            border: '1px solid rgba(167,139,250,0.3)'
                                        }}
                                        onClick={() => runDetection(prob._id)}
                                        disabled={isRunning}
                                    >
                                        {isRunning
                                            ? <><span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: 'var(--purple)' }} /> Running...</>
                                            : '🔍 Detect Plag'
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Results panel */}
                            {isExpanded && result && result.status === 'success' && result.reports.length > 0 && (
                                <div style={{ padding: '0' }}>
                                    {/* Column headers */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '60px 1fr 1fr 80px 120px',
                                        gap: '12px', padding: '8px 20px',
                                        fontSize: '11px', fontWeight: '700',
                                        color: 'var(--text3)', textTransform: 'uppercase',
                                        letterSpacing: '0.06em', background: 'var(--bg3)',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        <span>Sim%</span>
                                        <span>User A</span>
                                        <span>User B</span>
                                        <span>Overlap</span>
                                        <span>Actions</span>
                                    </div>

                                    {result.reports.map((report, ri) => {
                                        const codeKeyA = `${prob._id}_${ri}_A`;
                                        const codeKeyB = `${prob._id}_${ri}_B`;
                                        const simColor = getSimilarityColor(report.similarity);

                                        return (
                                            <div key={ri} style={{
                                                borderBottom: ri < result.reports.length - 1 ? '1px solid var(--border)' : 'none'
                                            }}>
                                                {/* Main row */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '60px 1fr 1fr 80px 120px',
                                                    gap: '12px', padding: '12px 20px',
                                                    alignItems: 'center'
                                                }}>
                                                    {/* Similarity */}
                                                    <div style={{
                                                        fontWeight: '800', fontSize: '15px',
                                                        color: simColor
                                                    }}>
                                                        {report.similarity}%
                                                    </div>

                                                    {/* User A */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <a
                                                            href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/profile/${report.userA.username}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent)' }}
                                                        >
                                                            {report.userA.username}
                                                        </a>
                                                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{report.userA.lang}</span>
                                                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                                                                onClick={() => toggleCode(codeKeyA)}
                                                            >
                                                                {codeVisible[codeKeyA] ? 'Hide Code' : 'View Code'}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,87,87,0.1)', color: 'var(--red)', border: '1px solid rgba(255,87,87,0.25)' }}
                                                                onClick={() => {}}
                                                            >
                                                                Ban
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,217,61,0.1)', color: 'var(--yellow)', border: '1px solid rgba(255,217,61,0.25)' }}
                                                                onClick={() => {}}
                                                            >
                                                                Warn
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* User B */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <a
                                                            href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/profile/${report.userB.username}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent)' }}
                                                        >
                                                            {report.userB.username}
                                                        </a>
                                                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{report.userB.lang}</span>
                                                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                                                                onClick={() => toggleCode(codeKeyB)}
                                                            >
                                                                {codeVisible[codeKeyB] ? 'Hide Code' : 'View Code'}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,87,87,0.1)', color: 'var(--red)', border: '1px solid rgba(255,87,87,0.25)' }}
                                                                onClick={() => {}}
                                                            >
                                                                Ban
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,217,61,0.1)', color: 'var(--yellow)', border: '1px solid rgba(255,217,61,0.25)' }}
                                                                onClick={() => {}}
                                                            >
                                                                Warn
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Overlap */}
                                                    <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '600' }}>
                                                        {report.overlap ?? '—'}
                                                    </div>

                                                    {/* Similarity bar */}
                                                    <div>
                                                        <div style={{
                                                            height: '6px', background: 'var(--bg3)',
                                                            borderRadius: '3px', overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                height: '6px', width: `${report.similarity}%`,
                                                                background: simColor, borderRadius: '3px',
                                                                transition: 'width 0.4s ease'
                                                            }} />
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>
                                                            {report.similarity >= 80 ? 'Very High' : report.similarity >= 50 ? 'High' : report.similarity >= 30 ? 'Medium' : 'Low'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Code panels */}
                                                {(codeVisible[codeKeyA] || codeVisible[codeKeyB]) && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: codeVisible[codeKeyA] && codeVisible[codeKeyB] ? '1fr 1fr' : '1fr',
                                                        gap: '0',
                                                        borderTop: '1px solid var(--border)',
                                                        background: 'var(--bg3)'
                                                    }}>
                                                        {codeVisible[codeKeyA] && (
                                                            <div style={{ borderRight: codeVisible[codeKeyB] ? '1px solid var(--border)' : 'none' }}>
                                                                <div style={{
                                                                    padding: '8px 14px', fontSize: '12px',
                                                                    fontWeight: '700', color: 'var(--accent)',
                                                                    borderBottom: '1px solid var(--border)',
                                                                    background: 'var(--bg2)'
                                                                }}>
                                                                    {report.userA.username} — {report.userA.lang}
                                                                </div>
                                                                <pre style={{
                                                                    margin: 0, padding: '14px',
                                                                    fontSize: '12px', lineHeight: '1.6',
                                                                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                                                                    overflow: 'auto', maxHeight: '360px',
                                                                    color: 'var(--text)', background: 'transparent'
                                                                }}>
                                                                    {report.userA.sourceCode}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {codeVisible[codeKeyB] && (
                                                            <div>
                                                                <div style={{
                                                                    padding: '8px 14px', fontSize: '12px',
                                                                    fontWeight: '700', color: 'var(--accent)',
                                                                    borderBottom: '1px solid var(--border)',
                                                                    background: 'var(--bg2)'
                                                                }}>
                                                                    {report.userB.username} — {report.userB.lang}
                                                                </div>
                                                                <pre style={{
                                                                    margin: 0, padding: '14px',
                                                                    fontSize: '12px', lineHeight: '1.6',
                                                                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                                                                    overflow: 'auto', maxHeight: '360px',
                                                                    color: 'var(--text)', background: 'transparent'
                                                                }}>
                                                                    {report.userB.sourceCode}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default PlagDetector;
