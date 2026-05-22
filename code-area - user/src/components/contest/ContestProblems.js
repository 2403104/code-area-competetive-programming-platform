import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContestContext from '../../myContext/contest/ContestContext';
import ContestNavbar from './ContestNavbar';
import ProblemContext from '../../myContext/problem/ProblemContext';

const ContestProblems = () => {
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState(null);
  const { getSubmissionList, subList } = useContext(ContestContext);
  const { id } = useParams();
  const username = localStorage.getItem('username');
    const { setShowNavbar } = useContext(ProblemContext);
    useEffect(() => {
        setShowNavbar(false);
        return () => setShowNavbar(true);
    }, []);
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const res = await fetch(`${BACKEND_URL}/user/get-contest/${id}`);
        const data = await res.json();
        if (data.success) {
          setContest(data.contest);
          setProblems(data.contest.problems);
        } else {
          console.error('Failed to fetch contest:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchContest();
  }, []);

  useEffect(() => {
    getSubmissionList(id, username);
  }, []);

  const handleProblemClick = (problemId) => {
    navigate(`/compete-contest/contest-problems/${contest._id}/${problemId}`);
  };

  const getProblemStatus = (problemId) => {
    const submissions = subList.filter(sub => sub.problemId === problemId);
    if (submissions.length === 0) return "Unattempted";
    return submissions.some(sub => sub.status === "Accepted") ? "Accepted" : "Wrong";
  };

  return (
    <>
      <div className="container mt-5" style={{ width: '90vw', backgroundColor: '#e2e6ea', borderRadius: '4px',marginLeft:'8vw' }}>
        <h2 className="mb-4 text-dark pt-3 pb-2 text-start mx-2">Contest Problems</h2>

        <table className="table table-bordered table-hover">
          <thead className="table-light text-center">
            <tr className="align-middle">
              <th style={{ width: '10%' }}>Q.No</th>
              <th style={{ width: '55%' }}>Title</th>
              <th style={{ width: '15%' }}>Score</th>
              <th style={{ width: '20%' }}>Accepted</th>
            </tr>
          </thead>

          <tbody>
            {!problems ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">Loading problems...</td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">No problems available</td>
              </tr>
            ) : (
              problems.map((problem, idx) => {
                const status = getProblemStatus(problem._id);

                const bgColor =
                  status === "Accepted"
                    ? 'rgba(6, 155, 6, 0.15)'
                    : status === "Wrong"
                      ? 'rgba(255, 0, 0, 0.1)'
                      : 'white';

                return (
                  <tr
                    key={idx}
                    className="text-center align-middle"
                    style={{ backgroundColor: bgColor }}
                  >
                    <td className="fw-semibold text-dark"
                      style={{
                        cursor: 'pointer',
                        backgroundColor:
                          status === 'Accepted'
                            ? 'rgba(51, 200, 51, 0.83)'
                            : status === 'Wrong'
                              ? 'rgba(239, 37, 37, 0.93)'
                              : 'white'
                      }}
                    >Q{idx + 1}</td>
                    <td
                      className="text-start fw-semibold text-primary"
                      onClick={() => handleProblemClick(problem._id)}
                      style={{cursor:'pointer'}}
                    >
                      {problem.title}
                    </td>

                    <td className="text-dark fw-semibold">{problem.score}</td>
                    <td className="text-success fw-semibold">x{problem.Accepted}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ContestProblems;
