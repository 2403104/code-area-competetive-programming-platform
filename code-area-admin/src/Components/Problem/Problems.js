import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api';

const TABS = [
    { id: 'detail', icon: '📝', label: 'Problem Detail' },
    { id: 'sample', icon: '🧪', label: 'Sample Test Cases' },
    { id: 'hidden', icon: '🔒', label: 'Hidden Test Cases' },
];

const defaultForm = {
    QNo: 0, title: '', description: '', difficulty: 'Easy',
    inputFormat: '', outputFormat: '', constraints: '',
    topics: '', timeLimit: 1, memoryLimit: 256, checkerCode: '',
};

const ProblemEditor = ({ problem, onSaved, onCancel }) => {
    const [activeTab, setActiveTab] = useState('detail');
    const [form, setForm] = useState(problem ? {
        ...problem,
        constraints: Array.isArray(problem.constraints) ? problem.constraints.join('\n') : (problem.constraints || ''),
        topics: Array.isArray(problem.topics) ? problem.topics.join('\n') : (problem.topics || ''),
    } : defaultForm);
    const [sampleCases, setSampleCases] = useState(
        problem?.sampleTestCases?.length ? problem.sampleTestCases : [{ input: '', output: '', explaination: '' }]
    );
    const [hiddenCases, setHiddenCases] = useState(problem?.testcases || []);
    const [saving, setSaving] = useState(false);
    const [savingHidden, setSavingHidden] = useState(false);
    const [msg, setMsg] = useState('');
    const [hiddenMsg, setHiddenMsg] = useState('');
    const isEdit = !!problem?._id;

    const addSample = () => setSampleCases([...sampleCases, { input: '', output: '', explaination: '' }]);
    const removeSample = (i) => setSampleCases(sampleCases.filter((_, idx) => idx !== i));
    const updateSample = (i, field, val) => { const arr = [...sampleCases]; arr[i][field] = val; setSampleCases(arr); };
    const addHidden = () => setHiddenCases([...hiddenCases, { input: '', expected: '' }]);
    const removeHidden = (i) => setHiddenCases(hiddenCases.filter((_, idx) => idx !== i));
    const updateHidden = (i, field, val) => { const arr = [...hiddenCases]; arr[i][field] = val; setHiddenCases(arr); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            QNo: Number(form.QNo),
            timeLimit: Number(form.timeLimit),
            memoryLimit: Number(form.memoryLimit),
            constraints: form.constraints.split('\n').filter(Boolean),
            topics: form.topics.split('\n').filter(Boolean),
            sampleTestCases: sampleCases,
            testcases: hiddenCases,
        };
        try {
            if (isEdit) {
                await api.put(`/admin/problems/${problem._id}`, payload);
            } else {
                await api.post('/admin/problems', payload);
            }
            setMsg('✅ Problem saved!');
            setTimeout(() => { setMsg(''); onSaved(); }, 1000);
        } catch {
            setMsg('❌ Failed to save problem');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveHidden = async () => {
        if (!isEdit) { setHiddenMsg('⚠️ Save problem first, then save hidden cases.'); return; }
        setSavingHidden(true);
        try {
            await api.put(`/admin/problems/${problem._id}/testcases`, { testcases: hiddenCases });
            setHiddenMsg('✅ Hidden test cases saved!');
            setTimeout(() => setHiddenMsg(''), 2000);
        } catch {
            setHiddenMsg('❌ Failed to save');
        } finally {
            setSavingHidden(false);
        }
    };

    return (
        <div className="card fade-in">
            <div className="flex items-center justify-between mb-20">
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{isEdit ? '✏️ Edit Problem' : '➕ New Problem'}</h2>
                <button className="btn btn-secondary btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>

            <div className="tabs mb-20" style={{ maxWidth: '520px' }}>
                {TABS.map(t => (
                    <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}>
                        <span>{t.icon}</span>{t.label}
                    </button>
                ))}
            </div>

            {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'} mb-16`}>{msg}</div>}

            <form onSubmit={handleSave}>
                {activeTab === 'detail' && (
                    <div className="fade-in">
                        <div className="grid-2 mb-0">
                            <div className="form-group">
                                <label className="form-label">Problem Title</label>
                                <input className="form-control" placeholder="e.g. Binary Search" value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">QNo</label>
                                <input type="number" className="form-control" value={form.QNo}
                                    onChange={e => setForm({ ...form, QNo: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-3 mb-16">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Difficulty</label>
                                <select className="form-control" value={form.difficulty}
                                    onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                                    <option>Easy</option><option>Medium</option><option>Hard</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Time Limit (s)</label>
                                <input type="number" className="form-control" min="0.5" step="0.5" value={form.timeLimit}
                                    onChange={e => setForm({ ...form, timeLimit: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Memory (MB)</label>
                                <input type="number" className="form-control" min="16" value={form.memoryLimit}
                                    onChange={e => setForm({ ...form, memoryLimit: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows="8" value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} required />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Input Format</label>
                                <textarea className="form-control" rows="4" value={form.inputFormat}
                                    onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Output Format</label>
                                <textarea className="form-control" rows="4" value={form.outputFormat}
                                    onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Constraints (one per line)</label>
                                <textarea className="form-control" rows="4" placeholder="1 ≤ n ≤ 10^5" value={form.constraints}
                                    onChange={e => setForm({ ...form, constraints: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Topics (one per line)</label>
                                <textarea className="form-control" rows="4" placeholder="Arrays\nHashMap" value={form.topics}
                                    onChange={e => setForm({ ...form, topics: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Checker Code (C++)</label>
                            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '8px', border: '1px solid var(--border)' }}>
                                <SyntaxHighlighter language="cpp" style={vscDarkPlus} customStyle={{ margin: 0, maxHeight: '180px', fontSize: '13px' }}>
                                    {form.checkerCode || '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }'}
                                </SyntaxHighlighter>
                            </div>
                            <textarea className="form-control mono" rows="5" value={form.checkerCode}
                                onChange={e => setForm({ ...form, checkerCode: e.target.value })}
                                placeholder="Write checker code here..." required />
                        </div>
                        <div className="flex justify-between mt-8">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="spinner" /> : isEdit ? '💾 Update' : '✨ Create Problem'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'sample' && (
                    <div className="fade-in">
                        {sampleCases.map((tc, i) => (
                            <div key={i} className="card mb-14" style={{ background: 'var(--bg3)' }}>
                                <div className="flex items-center justify-between mb-12">
                                    <h4 style={{ fontWeight: '700' }}>Sample #{i + 1}</h4>
                                    {sampleCases.length > 1 && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSample(i)}>🗑️</button>
                                    )}
                                </div>
                                <div className="grid-2 mb-12">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Input</label>
                                        <textarea className="form-control mono" rows="5" value={tc.input}
                                            onChange={e => updateSample(i, 'input', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Expected Output</label>
                                        <textarea className="form-control mono" rows="5" value={tc.output}
                                            onChange={e => updateSample(i, 'output', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Explanation</label>
                                    <textarea className="form-control" rows="2" value={tc.explaination}
                                        onChange={e => updateSample(i, 'explaination', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary mb-16" onClick={addSample}>➕ Add Sample</button>
                        <div className="flex justify-between">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="spinner" /> : isEdit ? '💾 Update' : '✨ Create Problem'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'hidden' && (
                    <div className="fade-in">
                        <div className="alert alert-info mb-16">
                            <span>ℹ️</span> Hidden test cases are not shown to contestants.
                        </div>
                        {hiddenMsg && (
                            <div className={`alert ${hiddenMsg.startsWith('✅') ? 'alert-success' : hiddenMsg.startsWith('⚠️') ? 'alert-info' : 'alert-error'} mb-16`}>
                                {hiddenMsg}
                            </div>
                        )}
                        {hiddenCases.length === 0 && (
                            <div className="empty-state" style={{ padding: '30px' }}>
                                <div className="icon">🔒</div>
                                <h3>No hidden cases</h3>
                            </div>
                        )}
                        {hiddenCases.map((tc, i) => (
                            <div key={i} className="card mb-12" style={{ background: 'var(--bg3)' }}>
                                <div className="flex items-center justify-between mb-10">
                                    <h4 style={{ fontWeight: '700' }}>🔒 Hidden #{i + 1}</h4>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeHidden(i)}>🗑️</button>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Input</label>
                                        <textarea className="form-control mono" rows="5" value={tc.input}
                                            onChange={e => updateHidden(i, 'input', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Expected Output</label>
                                        <textarea className="form-control mono" rows="5" value={tc.expected}
                                            onChange={e => updateHidden(i, 'expected', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between mt-8">
                            <button type="button" className="btn btn-secondary" onClick={addHidden}>➕ Add Hidden Case</button>
                            <button type="button" className="btn btn-success" onClick={handleSaveHidden} disabled={savingHidden}>
                                {savingHidden ? <span className="spinner" /> : '💾 Save Hidden Cases'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [editProblem, setEditProblem] = useState(null);
    const [search, setSearch] = useState('');
    const [diffFilter, setDiffFilter] = useState('all');

    const fetchProblems = () => {
        api.get('/admin/problems').then(data => {
            setProblems(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    };

    useEffect(() => { fetchProblems(); }, []);

    const handleSaved = () => { setView('list'); setEditProblem(null); fetchProblems(); };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this problem?')) return;
        await api.delete(`/admin/problems/${id}`);
        fetchProblems();
    };

    const filtered = problems.filter(p => {
        if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
        if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const getDiffBadge = (diff) => ({ Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' }[diff] || 'badge-easy');

    if (view === 'create') return (
        <div className="fade-in">
            <div className="page-header"><h1>📋 Problems</h1></div>
            <ProblemEditor onSaved={handleSaved} onCancel={() => setView('list')} />
        </div>
    );

    if (view === 'edit' && editProblem) return (
        <div className="fade-in">
            <div className="page-header"><h1>📋 Problems</h1></div>
            <ProblemEditor problem={editProblem} onSaved={handleSaved} onCancel={() => { setView('list'); setEditProblem(null); }} />
        </div>
    );

    return (
        <div className="fade-in">
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1>📋 Problems</h1>
                    <p>Manage all standalone problems</p>
                </div>
                <button className="btn btn-primary" onClick={() => setView('create')}>➕ New Problem</button>
            </div>

            <div className="card mb-16" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="form-control" style={{ maxWidth: '240px' }}
                        placeholder="🔍 Search problems..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                    <select className="form-control" style={{ maxWidth: '160px' }} value={diffFilter}
                        onChange={e => setDiffFilter(e.target.value)}>
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
                        {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center" style={{ padding: '60px' }}><span className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <h3>No problems yet</h3>
                        <button className="btn btn-primary mt-16" onClick={() => setView('create')}>New Problem</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map((prob, idx) => (
                        <div key={prob._id} className="card fade-in" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'var(--bg3)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '800', color: 'var(--accent)', flexShrink: 0
                            }}>{prob.QNo || idx + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-10 mb-4">
                                    <span style={{ fontWeight: '700' }}>{prob.title}</span>
                                    <span className={`badge ${getDiffBadge(prob.difficulty)}`}>{prob.difficulty}</span>
                                    {prob.topics?.slice(0, 2).map(t => (
                                        <span key={t} style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '20px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{t}</span>
                                    ))}
                                </div>
                                <div className="flex gap-16 text-xs text-muted">
                                    <span>⏱ {prob.timeLimit}s</span>
                                    <span>💾 {prob.memoryLimit}MB</span>
                                    <span>✅ {prob.Accepted || 0} / {prob.Submitted || 0}</span>
                                    <span>🧪 {prob.sampleTestCases?.length || 0} samples</span>
                                    <span>🔒 {prob.testcases?.length || 0} hidden</span>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <button className="btn btn-secondary btn-sm" onClick={() => { setEditProblem(prob); setView('edit'); }}>✏️ Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prob._id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Problems;
