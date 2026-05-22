import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';

const PutSubmissionData = () => {
    const navigate = useNavigate();
    const { subList, setSResult, title, id, getUser } = useContext(ProblemContext);
    const thisProbId = id;
    const filteredSubmissions = subList.filter(sub => sub?.problemId === thisProbId);
    useState(() => {
        getUser();
        if (filteredSubmissions.length === 0) {
            setSResult(null);
        }
    })

    const convertToIST = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    };
    const handleOnClick = (sub) => {
        // console.log(sub)
        setSResult(sub);
        navigate(`/problems/get-problem/${title}/verdict`);
    }
    return (
        <div>
            {
                filteredSubmissions.length === 0 ? (
                    <div className="container">
                        <h2 className="text-warning">No Submission Yet.</h2>
                    </div>
                ) : (
                    filteredSubmissions.map((sub, idx) => (
                        <div onClick={() => handleOnClick(sub)} key={idx} style={{
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '10px',
                            margin: '10px 0',
                            position: 'relative',
                            backgroundColor: sub.status === 'Accepted' ? 'rgba(0, 128, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)',
                            cursor: "pointer"
                        }}>
                            <div className="d-flex align-items-center">
                                {sub.errType === "" ? (
                                    <h4 style={{ color: sub.status === 'Accepted' ? 'green' : 'red', marginRight: '20px' }}>
                                        {sub.status}
                                    </h4>
                                ) : (
                                    <h4 style={{ color: sub.status === 'Accepted' ? 'green' : 'red', marginRight: '20px' }}>
                                        {sub.errType}
                                    </h4>

                                )}
                            <h6 className="blockquote mb-0">Runtime: {sub.time} ms</h6>
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '10px',
                                fontSize: '13px',
                                color: '#555'
                            }}>
                                Submitted At: {convertToIST(sub.submissionTime)}
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
};

export default PutSubmissionData;
