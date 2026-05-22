import React, { useEffect, useState,useContext } from 'react';
import ContestNavbar from './ContestNavbar';
import { useParams ,useNavigate} from 'react-router-dom';
import HorizontalLoader from '../HorizontalLoader';
import ProblemContext from '../../myContext/problem/ProblemContext';
const CurrentStandings = () => {
    const navigate=useNavigate();
    const { id } = useParams();
    const [cnt, setCnt] = useState(0);
    const [rankList, setRankList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setShowNavbar } = useContext(ProblemContext);
    useEffect(() => {
        setShowNavbar(false);
        return () => setShowNavbar(true);
    }, []);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
    const fetchAndCalculateStandings = async () => {
        const url = `${BACKEND_URL}/user/get-contest/${id}`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();

            let qCnt = json.contest.problems.length;
            setCnt(qCnt);

            const idMap = new Map();
            const scoreMap = new Map();
            let idx = 1;
            let userSet = new Set();

            for (let que of json.contest.problems) {
                idMap.set(que._id, idx);
                scoreMap.set(que._id, que.score);
                idx++;
            }

            let rankData = [];

            for (let detail of json.contest.submissions) {
                let username = detail.username;
                userSet.add(username);
                let mySubmission = detail.mySubmissions;

                mySubmission.sort((a, b) => new Date(a.submissionTime) - new Date(b.submissionTime));

                const arr = new Array(qCnt + 1).fill(0);
                let penalty = 0;
                let totalScore = 0;
                let correctCnt = 0;

                for (const [id, qNo] of idMap.entries()) {
                    let wrongAttempts = 0;
                    let solved = false;

                    for (const sub of mySubmission) {
                        if (sub.problemId === id) {
                            if (sub.status === 'Accepted') {
                                correctCnt++;
                                const qScore = scoreMap.get(sub.problemId);
                                const currScore = Math.max(0.3 * qScore, qScore - wrongAttempts * 50);
                                arr[qNo] = currScore;
                                totalScore += currScore;
                                penalty += wrongAttempts * 50;
                                solved = true;
                                break;
                            } else {
                                wrongAttempts++;
                            }
                        }
                    }

                    if (!solved && wrongAttempts > 0) {
                        arr[qNo] = -wrongAttempts;
                    }
                }


                rankData.push({
                    username,
                    score: arr,
                    penalty: penalty,
                    totalScore,
                    correctCnt
                });
            }

            for (let user of json.contest.registeredCandidate) {
                if (!userSet.has(user.username)) {
                    rankData.push({
                        username: user.username,
                        score: new Array(qCnt + 1).fill(0),
                        penalty: 0,
                        totalScore: 0,
                        correctCnt: 0
                    });
                }
            }

            rankData.sort((a, b) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                if (a.correctCnt !== b.correctCnt) return b.correctCnt - a.correctCnt;
                return a.penalty - b.penalty;
            });

            const csurl = `${BACKEND_URL}/user/update-current-standing/${id}`;
            try {
                const csRes = await fetch(csurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        finalStanding: rankData
                    })
                });
                const data = await csRes.json();
                if (csRes.ok) {
                    console.log("Final standings updated successfully");
                } else {
                    console.error("Failed to update standings:", data.message);
                }
            } catch (error) {
                console.error("Error updating standings:", error);
            }
        } catch (error) {
            console.log("Error calculating standings:", error);
        }
    };


    const fetchRankData = async () => {
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
        } catch (error) {
            console.error("Failed to fetch rank data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankData();

        const intervalId = setInterval(() => {
            fetchAndCalculateStandings();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const questionHeaders = [];
    for (let i = 1; i <= cnt; i++) {
        questionHeaders.push(
            <th key={`q${i}`} style={{ width: '10%' }}>{`Q${i}`}</th>
        );
    }

    return (
        <>
            <div className="container mt-4" style={{ width: '90vw', marginLeft: '5vw' }}>
                <h3 className="text-center mb-4">Current Standings</h3>
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
};

export default CurrentStandings;
