import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';

const ContestNavbar = () => {
  const { setShowNavbar } = useContext(ProblemContext);
  const { id } = useParams();
  const username = localStorage.getItem('username');

  const [contestName, setContestName] = useState('');
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const getTimeDifference = (current, end) => {
    const diffMs = end - current;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const res = await fetch(`${BACKEND_URL}/user/get-contest/${id}`);
        const data = await res.json();
        if (data.success) {
          const start = new Date(data.contest.startDate);
          const end = new Date(start.getTime() + data.contest.duration * 60000);
          setEndDate(end);
          setContestName(data.contest.contestName);
        } else {
          setContestName('Contest');
        }
      } catch (error) {
        console.error('Failed to fetch contest:', error);
        setContestName('Contest');
      }
    };
    fetchContest();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (endDate) {
        setTimeLeft(getTimeDifference(new Date(), endDate));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  useEffect(() => {
    setShowNavbar(false);
    return () => setShowNavbar(true);
  }, []);

  return (
    <div
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{
        backgroundColor: '#f1f3f5',
        borderBottom: '1px solid white',
        position: 'sticky',
        top: 0,
        zIndex: 1030,
        width: '100vw',
      }}
    >
      <div className="d-flex gap-3">
        <NavLink to={`/compete-contest/contest-problems/${id}`} className={({ isActive }) =>
          `fw-semibold px-4 py-1 rounded-2 text-decoration-none ${isActive ? 'bg-primary text-white' : 'bg-light text-dark border'}`
        }>
          Problems
        </NavLink>

        <NavLink to={`/compete-contest/my-submissions/${id}/${username}`} className={({ isActive }) =>
          `fw-semibold px-4 py-1 rounded-2 text-decoration-none ${isActive ? 'bg-primary text-white' : 'bg-light text-dark border'}`
        }>
          My Submissions
        </NavLink>

        <NavLink to={`/compete-contest/current-standings/${id}`} className={({ isActive }) =>
          `fw-semibold px-4 py-1 rounded-2 text-decoration-none ${isActive ? 'bg-primary text-white' : 'bg-light text-dark border'}`
        }>
          Current Standings
        </NavLink>
      </div>

      {timeLeft.hours>=0 && timeLeft.minutes>=0 && timeLeft.seconds>=0 && <div className="d-flex gap-2 align-items-center mx-0">
        <div className="bg-light border rounded text-center px-2 py-1" style={{ minWidth: '50px' }}>
          <div className="fw-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div style={{ fontSize: '0.75rem' }}>Hours</div>
        </div>
        <div className="bg-light border rounded text-center px-2 py-1" style={{ minWidth: '50px' }}>
          <div className="fw-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div style={{ fontSize: '0.75rem' }}>Minutes</div>
        </div>
        <div className="bg-light border rounded text-center px-2 py-1" style={{ minWidth: '50px' }}>
          <div className="fw-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div style={{ fontSize: '0.75rem' }}>Seconds</div>
        </div>
      </div>}

      <div
        className="fw-bold mx-5"
        style={{
          fontSize: '1.5rem',
          fontFamily: 'Segoe UI, Roboto, sans-serif',
          whiteSpace: 'nowrap',
          color: '#87cefa',
        }}
      >
        {contestName}
      </div>
    </div>
  );
};

export default ContestNavbar;
