import React, { useEffect, useState } from 'react';
import ContestScheduleBox from './ContestScheduleBox';

const ContestSchedule = () => {
  const [contestList, setContestList] = useState([]);
  const fetchContests = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
      const url = `${BACKEND_URL}/user/get-all-contest`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const json = await res.json();
      setContestList(json.contests);
    } catch (err) {
      console.error('Failed to fetch contests:', err);
    }
  }
  useEffect(() => {
    fetchContests();
  }, [])

  return (
    <div className="container mt-5 text-center">
      {contestList.length === 0 ? (
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <ContestScheduleBox contests={contestList} />
      )}
    </div>
  );
};

export default ContestSchedule;
