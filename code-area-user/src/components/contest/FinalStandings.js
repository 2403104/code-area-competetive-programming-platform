import React, { useState, useEffect } from 'react'
import { useParams,useNavigate } from 'react-router-dom';
import HorizontalLoader from '../HorizontalLoader';
const FinalStandings = () => {
    const navigate=useNavigate();
    const { id } = useParams();
    const [cnt, setCnt] = useState(0);
    const [rankList, setRankList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contestName,setContestName]=useState("Contest");
    const fetchRankData = async () => {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const url = `${BACKEND_URL}/user/get-contest/${id}`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            setRankList(json.contest.finalStanding);
            setCnt(json.contest.problems.length);
            setLoading(false);
            setContestName(json.contest.contestName)
        } catch (error) {
            console.error("Failed to fetch rank data", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRankData();
    }, [])
    const questionHeaders = [];
    for (let i = 1; i <= cnt; i++) {
        questionHeaders.push(
            <th key={`q${i}`} style={{ width: '10%' }}>{`Q${i}`}</th>
        );
    }

    return (
        <>
            <div className="container mt-4" style={{ width: '90vw', marginLeft: '5vw' }}>
                <h3 className="text-center mb-4">{contestName} - Final Standings</h3>
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
                                        <td className="text-primary fw-bolder" onClick={()=>navigate(`/code-area/profile/${candidate.username}`)} style={{cursor:'pointer'}}>{candidate.username}</td>
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
}

export default FinalStandings
