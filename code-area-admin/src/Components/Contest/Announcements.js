import React, { useState } from 'react';
import api from '../../api';

const Announcements = ({ contestId, contest, onUpdate }) => {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');

    const announcements = contest?.announcements || [];
    const candidateCount = contest?.registeredCandidateCnt || 0;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            await api.post(`/admin/contests/${contestId}/announce`, { text });
            setMsg(`✅ Announcement sent to ${candidateCount} registered candidate${candidateCount !== 1 ? 's' : ''}!`);
            setText('');
            onUpdate();
            setTimeout(() => setMsg(''), 3000);
        } catch {
            setMsg('❌ Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div>
            <div className="card mb-20">
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>📢 Send Announcement</h2>
                <div className="alert alert-info mb-16">
                    <span>📬</span> This announcement will be sent to all <strong>{candidateCount}</strong> registered candidate{candidateCount !== 1 ? 's' : ''}.
                </div>
                {msg && (
                    <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'} mb-16`}>{msg}</div>
                )}
                <form onSubmit={handleSend}>
                    <div className="form-group">
                        <label className="form-label">Announcement Message</label>
                        <textarea className="form-control" rows="5"
                            placeholder="Write your announcement here..."
                            value={text} onChange={e => setText(e.target.value)} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">{text.length} characters</span>
                        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                            {sending ? <span className="spinner" /> : '📤 Send to Candidates'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>
                    📋 Announcement History
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text2)', marginLeft: '10px' }}>({announcements.length})</span>
                </h2>
                {announcements.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="icon">📢</div>
                        <h3>No announcements yet</h3>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[...announcements].reverse().map((ann, i) => (
                            <div key={i} className="fade-in" style={{
                                padding: '16px 18px', background: 'var(--bg3)',
                                border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)',
                                borderRadius: 'var(--radius)',
                            }}>
                                <div className="flex items-center justify-between mb-8">
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>
                                        ANNOUNCEMENT #{announcements.length - i}
                                    </span>
                                    <span className="text-xs text-muted">{formatTime(ann.announcedAt)}</span>
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ann.text}</p>
                                <div className="flex items-center gap-8 mt-8">
                                    <span style={{
                                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                                        background: 'rgba(61,214,140,0.1)', color: 'var(--green)',
                                        border: '1px solid rgba(61,214,140,0.2)', fontWeight: '600'
                                    }}>✓ Sent to {candidateCount} candidates</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;
