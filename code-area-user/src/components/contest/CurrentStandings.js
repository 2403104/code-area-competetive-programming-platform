import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HorizontalLoader from '../HorizontalLoader';
import ProblemContext from '../../myContext/problem/ProblemContext';

const CurrentStandings = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cnt, setCnt] = useState(0);
    const [rankList, setRankList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const { setShowNavbar } = useContext(ProblemContext);
    const eventSourceRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
        setShowNavbar(false);
        return () => setShowNavbar(true);
    }, []);

    const connectSSE = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
        }

        const es = new EventSource(`${BACKEND_URL}/user/${id}/standings/stream`);
        eventSourceRef.current = es;

        es.onopen = () => setConnected(true);

        es.onmessage = (event) => {
            try {
                const { standings, problemCount } = JSON.parse(event.data);
                setRankList(standings);
                setCnt(problemCount);
                setLoading(false);
            } catch (err) {
                console.error('Failed to parse standings:', err);
            }
        };

        es.onerror = () => {
            setConnected(false);
            es.close();
            reconnectTimerRef.current = setTimeout(connectSSE, 3000);
        };
    };

    useEffect(() => {
        connectSSE();
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        };
    }, [id]);

    const questionHeaders = [];
    for (let i = 1; i <= cnt; i++) {
        questionHeaders.push(
            <th key={`q${i}`} style={{ width: '10%' }}>{`Q${i}`}</th>
        );
    }

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.3); }
                    50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.1); }
                }
            `}</style>

            <div className="container mt-4" style={{ width: '90vw', marginLeft: '5vw' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">Current Standings</h3>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{
                            display: 'inline-block',
                            width: 10, height: 10,
                            borderRadius: '50%',
                            backgroundColor: connected ? '#22c55e' : '#f59e0b',
                            animation: connected ? 'pulse 2s infinite' : 'none',
                        }} />
                        <small className="text-muted">{connected ? 'Live' : 'Reconnecting...'}</small>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                        <HorizontalLoader />
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover text-center">
                            <thead className="table-light align-middle">
                                <tr>
                                    <th style={{ width: '5%' }}>Rank</th>
                                    <th style={{ width: '15%' }}>Username</th>
                                    <th style={{ width: '5%' }}></th>
                                    <th style={{ width: '10%' }}>Penalty</th>
                                    <th style={{ width: '5%' }}></th>
                                    {questionHeaders}
                                    <th style={{ width: '5%' }}></th>
                                    <th style={{ width: '10%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankList.map((candidate, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td
                                            className="text-primary fw-bolder"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/code-area/profile/${candidate.username}`)}
                                        >
                                            {candidate.username}
                                        </td>
                                        <td></td>
                                        <td className="fw-bold">{candidate.penalty}</td>
                                        <td></td>
                                        {Array.from({ length: cnt }, (_, i) => {
                                            const score = candidate.score[i + 1];
                                            return (
                                                <td
                                                    key={`score-${i}`}
                                                    className={`fw-bold ${score > 0
                                                        ? 'text-success'
                                                        : score < 0
                                                            ? 'text-danger'
                                                            : 'text-muted'
                                                        }`}
                                                >
                                                    {score > 0 ? score : score < 0 ? score : ''}
                                                </td>
                                            );
                                        })}
                                        <td></td>
                                        <td className="fw-bolder text-dark">{candidate.totalScore}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default CurrentStandings;