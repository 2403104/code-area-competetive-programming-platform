import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';

const ContestNavbar = () => {
  const { setShowNavbar } = useContext(ProblemContext);
  const { id } = useParams();
  const username = localStorage.getItem('username');

  const [contestName, setContestName] = useState('');
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [alertAnnouncement, setAlertAnnouncement] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isInitialLoad = useRef(true);

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

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const REACT_APP_ADMIN_BACKEND_URL = process.env.REACT_APP_ADMIN_BACKEND_URL || 'http://localhost:3003';
    const es = new EventSource(`${REACT_APP_ADMIN_BACKEND_URL}/admin/contests/${id}/announcements/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    };

    es.onmessage = (event) => {
      try {
        const newAnnouncement = JSON.parse(event.data);
        const uniqueKey = String(newAnnouncement._id || newAnnouncement.id || JSON.stringify(newAnnouncement));
        const lastSeen = localStorage.getItem(`last_announcement_${id}`);
        if (lastSeen !== uniqueKey) {
          localStorage.setItem(`last_announcement_${id}`, uniqueKey);
          setAlertAnnouncement(newAnnouncement);
        }
      } catch (err) {
        console.error('Failed to parse announcement:', err);
      }
    };

    es.onerror = () => {
      es.close();
      isInitialLoad.current = true;
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

  useEffect(() => {
    if (!alertAnnouncement) return;
    const t = setTimeout(() => setAlertAnnouncement(null), 10000);
    return () => clearTimeout(t);
  }, [alertAnnouncement]);

  return (
    <>
      {alertAnnouncement && (
        <div style={{
          position: 'fixed', top: '70px', right: '20px', zIndex: 9999,
          width: '360px', padding: '16px 18px',
          background: '#fff', border: '1px solid #dee2e6',
          borderLeft: '4px solid #0d6efd', borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease',
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(120%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="fw-bold text-primary" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
              📢 NEW ANNOUNCEMENT
            </span>
            <button
              onClick={() => setAlertAnnouncement(null)}
              className="btn-close"
              style={{ fontSize: '10px' }}
            />
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
            {alertAnnouncement.text}
          </p>
        </div>
      )}

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

          <NavLink to={`/compete-contest/announcements/${id}`} className={({ isActive }) =>
            `fw-semibold px-4 py-1 rounded-2 text-decoration-none ${isActive ? 'bg-primary text-white' : 'bg-light text-dark border'}`
          }>
            Announcements
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
    </>
  );
};

export default ContestNavbar;