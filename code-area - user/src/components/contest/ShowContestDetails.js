import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RulesAndRegulations from './RulesAndRegulations';

const ShowContestDetails = () => {
    const { id } = useParams();
    const [contest, setContest] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const [registrationStatus, setRegistrationStatus] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!localStorage.getItem('auth-token');

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";


    const formatTimeLeft = (startTime) => {
        const diff = new Date(startTime) - currentTime;
        if (diff <= 0) return "Contest Running";

        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / 1000 / 60) % 60;
        const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);

        let result = '';
        if (days) result += `${days}d `;
        if (hours) result += `${hours}h `;
        if (minutes) result += `${minutes}m `;
        if (seconds) result += `${seconds}s`;
        return result.trim();
    };

    const getContestStatus = (startDate, duration) => {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + duration * 60000);
        if (currentTime < start) return formatTimeLeft(start);
        else if (currentTime < end) return "Contest Running...";
        else return "Ended";
    };

    const checkRegistered = async () => {
        const username = localStorage.getItem('username');
        if (!username || !contest._id) return false;
        try {
            const url = `${BACKEND_URL}/user/check-registered/${contest._id}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const json = await res.json();
            if (json.success) {
                setRegistrationStatus(json.isRegistered);
            }
        } catch (error) {
            console.error('Check registration error:', error);
        }
    };

    const handleRegistration = async () => {
        const username = localStorage.getItem('username');
        if (!username) return alert('Username not found in localStorage.');
        setLoading(true);
        try {
            const url = `${BACKEND_URL}/user/register-user/${contest._id}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const json = await res.json();
            if (json.success) {
                setRegistrationStatus(true);
            } else {
                alert(json.error || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Something went wrong during registration.');
        }
        setLoading(false);
    };

    const handleUnregister = async () => {
        const username = localStorage.getItem('username');
        if (!username) return;
        setLoading(true);
        try {
            const url = `${BACKEND_URL}/user/unregister-user/${contest._id}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const json = await res.json();
            if (json.success) {
                setRegistrationStatus(false);
            } else {
                alert(json.error || "Couldn't unregister.");
            }
        } catch (error) {
            console.error('Unregistration error:', error);
            alert("Couldn't unregister, something went wrong.");
        }
        setLoading(false);
    };

    const fetchContest = async () => {
        try {
            const url = `${BACKEND_URL}/user/get-contest/${id}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            if (json.success) {
                setContest(json.contest);
            }
        } catch (error) {
            console.error('Error fetching contest:', error);
        }
    };

    useEffect(() => {
        fetchContest();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [id]);

    useEffect(() => {
        if (contest._id) checkRegistered();
    }, [contest]);

    if (!contest || !contest.contestName) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const formattedDate = new Date(contest.startDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const contestStatus = getContestStatus(contest.startDate, contest.duration);

    return (
        <div className="container mt-2 rounded" style={{ width: '100vw', background: '#f8f9fc', marginLeft: '7vw' }}>
            <div className="mb-4">
                <h1 className="fw-bold text-primary">{contest.contestName}</h1>
            </div>

            <div className="mb-3 d-flex">
                <div className="flex-grow-1 mx-3">
                    <h3 className="text-secondary fs-5 mb-3">
                        <strong className="text-dark">Start Date:</strong> {formattedDate}
                    </h3>
                    <h3 className="text-secondary fs-5 mb-3">
                        <strong className="text-dark">Duration:</strong> {contest.duration} minutes
                    </h3>
                </div>

                <div className="mx-5" style={{ minWidth: '300px' }}>
                    <h1 className="fw-bold" style={{ whiteSpace: 'nowrap', color: '#BCD4E6', fontSize: '4rem' }}>
                        {contest.organisation}
                    </h1>
                </div>
            </div>

            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                {contestStatus === "Contest Running..." ? (
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2 px-3 rounded" style={{ backgroundColor: '#e2edfa', border: '1px solid #c7e0f5' }}>
                            <span className="text-primary fw-semibold">
                                🔥 {contestStatus}
                            </span>
                        </div>
                        <button
                            className={`btn px-4 fw-bold ${registrationStatus ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => registrationStatus && (window.location.href = `/compete-contest/contest-problems/${contest._id}`)}
                            disabled={!registrationStatus}
                            title={!registrationStatus ? "Only registered candidates can participate" : ""}
                        >
                            Enter
                        </button>
                    </div>
                ) : (
                    <>
                        {!registrationStatus && (
                            <button
                                className="btn btn-success px-4 fw-bold"
                                onClick={handleRegistration}
                                disabled={!isLoggedIn || loading}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm text-light" />
                                ) : (
                                    "Register for Contest"
                                )}
                            </button>
                        )}
                        {registrationStatus && (
                            <button
                                className="btn btn-success px-4 fw-bold"
                                onClick={handleUnregister}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                disabled={!isLoggedIn || loading}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm text-light" />
                                ) : (
                                    isHovered ? "Unregister for Contest" : "Registration Completed"
                                )}
                            </button>
                        )}
                    </>
                )}

                {contestStatus === "Ended" && (
                    <div className="p-2 px-3 rounded" style={{ backgroundColor: '#fae2e2', border: '1px solid #f5c2c2' }}>
                        <span className="text-danger fw-semibold">
                            ✅ Contest is Over.
                        </span>
                    </div>
                )}

                {contestStatus !== "Contest Running..." && contestStatus !== "Ended" && (
                    <div className="p-2 px-3 rounded" style={{ backgroundColor: '#e2edfa', border: '1px solid #c7e0f5' }}>
                        <span className="text-primary fw-semibold">
                            ⏳ Starts in: {contestStatus}
                        </span>
                    </div>
                )}
            </div>

            <RulesAndRegulations />
        </div>
    );
};

export default ShowContestDetails;
