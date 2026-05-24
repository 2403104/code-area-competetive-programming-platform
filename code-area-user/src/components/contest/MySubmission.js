import React, { useContext, useEffect, useState } from 'react';
import ContestNavbar from './ContestNavbar';
import { useParams, Link } from 'react-router-dom';
import ContestContext from '../../myContext/contest/ContestContext';
import HorizontalLoader from '../HorizontalLoader';
import SubmissionModal from './SubmissionModal';
import ProblemContext from '../../myContext/problem/ProblemContext';
const MySubmission = () => {
    const { subList, getSubmissionList, tempSubList, submissionLoading } = useContext(ContestContext);
    const { id, username } = useParams();
    const [selectedSubmission, setSelectedSubmission] = useState(null); 

    useEffect(() => {
        if (tempSubList.length === 0) {
            getSubmissionList(id, username);
        }
    }, []);
    const { setShowNavbar } = useContext(ProblemContext);
    useEffect(() => {
        setShowNavbar(false);
        return () => setShowNavbar(true);
    }, []);
    const getVerdictClass = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-success';
            case 'Running on testcases...': return 'text-secondary';
            default: return 'text-danger';
        }
    };

    const allSubmissions = [...tempSubList, ...subList].sort((a, b) =>
        new Date(b.submissionTime) - new Date(a.submissionTime)
    );

    return (
        <>
            <table className="table table-bordered table-hover mt-3" style={{ width: '80vw', marginLeft: '9vw' }}>
                <thead className="table-light text-center">
                    <tr className="align-middle">
                        <th style={{ width: '30%' }}>Problem</th>
                        <th style={{ width: '15%' }}>Language</th>
                        <th style={{ width: '20%' }}>Submitted At</th>
                        <th style={{ width: '40%' }}>Verdict</th>
                        <th style={{ width: '20%' }}>Runtime</th>
                        <th style={{ width: '20%' }}>View Submission</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {allSubmissions.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-muted fw-bold py-4">
                                Currently no submissions done yet.
                            </td>
                        </tr>
                    ) : (
                        allSubmissions.map((submission, idx) => (
                            <tr key={idx}>
                                <td className="text-center text-primary">
                                  <Link to={`/compete-contest/contest-problems/${id}/${submission.problemId}`}>{submission.problemId}</Link>
                                </td>
                                <td>{submission.code[0]?.language || "-"}</td>
                                <td>{new Date(submission?.submissionTime).toLocaleString()}</td>
                                <td className="text-center align-middle" style={{ whiteSpace: 'nowrap' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            width: '100%',
                                            position: 'relative'
                                        }}
                                    >
                                        <span className={`fw-bolder ${getVerdictClass(submission.status)}`}>
                                            {submission.errType !== "" ? submission.errType : submission.status}
                                        </span>
                                        {submissionLoading && submission.status === "Running on testcases..." && (
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                <HorizontalLoader />
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td>{submission.status === 'Running on testcases...' ? '-' : `${submission?.time} ms`}</td>
                                <td
                                    style={{ fontSize: '14px', color: 'blue', cursor: 'pointer' }}
                                    onClick={() => setSelectedSubmission(submission)}
                                >
                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedSubmission && (
                <SubmissionModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </>
    );
};

export default MySubmission;
