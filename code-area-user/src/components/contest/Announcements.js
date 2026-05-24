import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import HorizontalLoader from '../HorizontalLoader';
import ProblemContext from '../../myContext/problem/ProblemContext';
import ContestNavbar from './ContestNavbar';

const Announcements = () => {
  const { id } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setShowNavbar } = useContext(ProblemContext);

  useEffect(() => {
      setShowNavbar(false);
      return () => setShowNavbar(true);
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${BACKEND_URL}/user/announcements/${id}`);
        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [id]);

  const formatTime = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="container mt-4" style={{ width: '90vw', marginLeft: '5vw' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">📢 Announcements
          <span className="text-muted fw-normal ms-2" style={{ fontSize: '16px' }}>({announcements.length})</span>
        </h3>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <HorizontalLoader />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div style={{ fontSize: '40px' }}>📢</div>
          <h5 className="mt-2">No announcements yet</h5>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {[...announcements].reverse().map((ann, i) => (
            <div key={ann._id} style={{
              padding: '16px 18px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderLeft: '3px solid #0d6efd',
              borderRadius: '8px',
            }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-primary" style={{ fontSize: '12px' }}>
                  ANNOUNCEMENT #{announcements.length - i}
                </span>
                <span className="text-muted" style={{ fontSize: '12px' }}>{formatTime(ann.announcedAt)}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                {ann.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;