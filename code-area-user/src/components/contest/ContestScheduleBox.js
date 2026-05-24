import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ContestScheduleBox = ({ contests }) => {
  const navigate = useNavigate();
  const [localContests, setLocalContests] = useState(contests);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [registeredMap, setRegisteredMap] = useState({});
  const [hoverMap, setHoverMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const authToken = localStorage.getItem('auth-token');
  const username = localStorage.getItem('username');

  const handleEnterRequest = (username, _id) => {
    navigate(`/compete-contest/contest-problems/${_id}`);
  };

  const getRunningStatus = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(new Date(startDate).getTime() + duration * 60000);
    if (currentTime >= start && currentTime <= end) return "running";
    return "";
  };

  const handleOnClick = (contest) => {
    navigate(`/contest/contest-details/${contest._id}`);
  };

  const formatTimeLeft = (startTime) => {
    const diff = new Date(startTime) - currentTime;
    if (diff <= 0) return "Contest is running...";

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

  const checkRegisteredStatus = async (contestId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${BACKEND_URL}/user/check-registered/${contestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const json = await res.json();
      return json.success ? json.isRegistered : false;
    } catch (err) {
      console.error("Error checking registration:", err);
      return false;
    }
  };

  const registerForContest = async (e, contestId) => {
    e.stopPropagation();
    if (!authToken || !username) {
      alert("Please login to register.");
      return;
    }
    setLoadingMap(prev => ({ ...prev, [contestId]: true }));
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${BACKEND_URL}/user/register-user/${contestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const json = await res.json();
      if (json.success) {
        setRegisteredMap(prev => ({ ...prev, [contestId]: true }));
        setLocalContests(prev =>
          prev.map(c => c._id === contestId ? { ...c, registeredCandidateCnt: (c.registeredCandidateCnt || 0) + 1 } : c)
        );
      } else {
        alert(json.error || "Failed to register.");
      }
    } catch (err) {
      alert("Error registering.");
      console.error(err);
    }
    setLoadingMap(prev => ({ ...prev, [contestId]: false }));
  };

  const unregisterFromContest = async (e, contestId) => {
    e.stopPropagation();
    setLoadingMap(prev => ({ ...prev, [contestId]: true }));
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${BACKEND_URL}/user/unregister-user/${contestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const json = await res.json();
      if (json.success) {
        setRegisteredMap(prev => ({ ...prev, [contestId]: false }));
        setLocalContests(prev =>
          prev.map(c => c._id === contestId ? { ...c, registeredCandidateCnt: Math.max((c.registeredCandidateCnt || 1) - 1, 0) } : c)
        );
      } else {
        alert(json.error || "Failed to unregister.");
      }
    } catch (err) {
      alert("Error unregistering.");
      console.error(err);
    }
    setLoadingMap(prev => ({ ...prev, [contestId]: false }));
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      const map = {};
      await Promise.all(contests.map(async (contest) => {
        const isReg = await checkRegisteredStatus(contest._id);
        map[contest._id] = isReg;
      }));
      setRegisteredMap(map);
    };
    if (authToken && username) fetchRegistrationStatus();
  }, [contests]);

  useEffect(() => {
    setLocalContests(contests);
  }, [contests]);

  const upcoming = localContests.filter(
    c => new Date(new Date(c.startDate).getTime() + c.duration * 60000) > currentTime
  );
  const past = localContests.filter(
    c => new Date(new Date(c.startDate).getTime() + c.duration * 60000) < currentTime
  );


  return (
    <>
      <div className="container mt-5" style={{ width: '100vw', backgroundColor: '#e2e6ea', borderRadius: '2px', marginLeft: '5vw' }}>
        <h2 className="mb-4 text-dark pt-1 pb-0 text-start mx-1">Upcoming Contests</h2>
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr className="align-middle text-center">
              <th style={{ width: '35%' }}>Name</th>
              <th style={{ width: '25%' }}>Start Time</th>
              <th style={{ width: '15%' }}>Duration</th>
              <th style={{ width: '15%' }}>Starts In</th>
              <th style={{ width: '15%' }}></th>
            </tr>
          </thead>
          <tbody>
            {upcoming.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No upcoming contests
                </td>
              </tr>
            ) : (
              upcoming.map((contest, idx) => {
                const { contestName, startDate, duration, _id, registeredCandidateCnt } = contest;

                const formattedDate = new Date(startDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });

                const isRegistered = registeredMap[_id];
                const isHovered = hoverMap[_id];
                const isLoading = loadingMap[_id];
                const isRunning = getRunningStatus(startDate, duration) === "running";

                return (
                  <tr key={`upcoming-${idx}`} className="align-middle text-center">
                    <td className="fw-semibold text-primary" onClick={() => handleOnClick(contest)} style={{ cursor: 'pointer' }}>{contestName}</td>
                    <td>{formattedDate}</td>
                    <td>{duration} min</td>
                    <td>{isRunning ? "Contest Running..." : formatTimeLeft(startDate)}</td>
                    <td className="text-center">
                      {isRunning ? (
                        <div className="d-flex flex-column align-items-center">
                          <div className="text-primary fw-bold" style={{ fontSize: "0.85rem", lineHeight: "1" }}>
                            x{registeredCandidateCnt || 0}
                          </div>
                          <div
                            className={`mt-1 px-2 py-1 text-light ${isRegistered ? 'bg-success' : 'bg-secondary'}`}
                            style={{
                              cursor: isRegistered ? 'pointer' : 'not-allowed',
                              fontSize: "0.85rem",
                              lineHeight: "1",
                              whiteSpace: "nowrap",
                              minWidth: "90px"
                            }}
                            onClick={() => isRegistered && handleEnterRequest(username, _id)}
                            title={!isRegistered ? 'Only registered candidates can participate !' : ''}
                          >
                            Enter
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-column align-items-center">
                          <div className="text-primary fw-bold" style={{ fontSize: "0.85rem", lineHeight: "1" }}>
                            x{registeredCandidateCnt || 0}
                          </div>
                          <div
                            className="bg-danger text-light mt-1 px-2 py-1"
                            style={{
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              lineHeight: "1",
                              whiteSpace: "nowrap",
                              minWidth: "90px",
                              position: "relative"
                            }}
                            onClick={(e) =>
                              isRegistered
                                ? unregisterFromContest(e, _id)
                                : registerForContest(e, _id)
                            }
                            onMouseEnter={() => setHoverMap(prev => ({ ...prev, [_id]: true }))}
                            onMouseLeave={() => setHoverMap(prev => ({ ...prev, [_id]: false }))}
                          >
                            {isLoading ? (
                              <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              isRegistered ? (isHovered ? "Unregister" : "Registered") : "Register"
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="container mt-5" style={{ width: '100vw', backgroundColor: '#e2e6ea', borderRadius: '2px', marginLeft: '5vw' }}>
        <h2 className="mb-4 text-dark pt-1 pb-0 text-start mx-1">Past Contests</h2>
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr className="align-middle text-center">
              <th style={{ width: '35%' }}>Name</th>
              <th style={{ width: '25%' }}>Start Time</th>
              <th style={{ width: '15%' }}>Duration</th>
              <th style={{ width: '15%' }}>Final Stading</th>
            </tr>
          </thead>
          <tbody>
            {past.map((contest, idx) => {
              const { contestName, startDate, duration, _id } = contest;
              const formattedDate = new Date(startDate).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
              return (
                <tr key={`upcoming-${idx}`} className="align-middle text-center">
                  <td className="fw-semibold text-primary">{contestName}</td>
                  <td>{formattedDate}</td>
                  <td>{duration} min</td>
                  <td>
                    <Link
                      to={`/compete-contest/final-standings/${_id}`}
                      className="text-decoration-none text-primary fw-semibold"
                      style={{ cursor: 'pointer', fontSize: '1.0rem' }}
                    >
                      Final Standing
                    </Link>
                  </td>
                </tr>
              );

            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ContestScheduleBox;
