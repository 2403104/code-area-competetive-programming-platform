import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Testcases from './Testcases';
import TestcasesOuptut from './TestcasesOuptut';
import ContestContext from '../../../myContext/contest/ContestContext';
const ProblemDescription = () => {
    const { id, problemId } = useParams();
    const username=localStorage.getItem('username');
    const { setTestcase, scrollRef, problem, setProblem, getSubmissionList } = useContext(ContestContext);

    const fetchContest = async () => {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const url = `${BACKEND_URL}/user/get-contest/${id}`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                const problems = data.contest.problems;
                for (let i of problems) {
                    if (i._id === problemId) {
                        setProblem(i);
                        break;
                    }
                }
            } else {
                console.error('Failed to fetch contest:', data.error);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };
    useEffect(() => {
        fetchContest();
    }, [])
    useEffect(() => {
        if (problem?.sampleTestCases && problem.sampleTestCases.length > 0) {
            setTestcase(problem.sampleTestCases[0].input);
        }
    }, [problem]);


    // useEffect(() => {
    //     getSubmissionList(id, username);
    // }, []);
    return (
        <>
            <div className="container mt-2 mx-0 w-100">
                <h3 className="fw-bold text-muted">{problem?.QNo}. {problem?.title}</h3>
                <pre
                    className="blockquote mb-0"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                >
                    Time Limit : {problem?.timeLimit}s
                </pre>
                <pre
                    className="blockquote mt-0"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                >
                    Memory Limit : {problem?.memoryLimit}mb
                </pre>
                <pre
                    className="blockquote"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                >
                    {problem?.description}
                </pre>

                <div className="container mx-0">
                    <div className="fw-bold blockquote">Input Type</div>
                    <pre
                        className="blockquote"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                    >
                        {problem?.inputFormat}
                    </pre>
                </div>

                <div className="container mx-0">
                    <div className="fw-bold blockquote">Output Type</div>
                    <pre
                        className="blockquote"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                    >
                        {problem?.outputFormat}
                    </pre>
                </div>

                <div className="container mx-0">
                    <div className="fw-bold blockquote">Constraints</div>
                    <p className="blockquote mx-3">
                        {problem?.constraints?.map((constraint, index) => (
                            <span key={`constraints-${index}`}>
                                {constraint}<br />
                            </span>
                        ))}
                    </p>
                </div>

                {problem?.sampleTestCases?.map((ex, idx) => (
                    <div key={`problem-${idx}`} className="fw-bold blockquote">
                        Sample Test Case {idx + 1}
                        <div className="container">
                            <div className="fw-bold">Input:
                                <div className="text-muted" style={{ border: "1px solid gray" }}>
                                    {ex.input?.split('\n').map((ele, index, arr) => (
                                        <React.Fragment key={`problem-input-${index}`}>
                                            <pre
                                                style={{
                                                    margin: 0,
                                                    padding: '4px 8px',
                                                    transition: 'background-color 0.3s ease',
                                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e9e9e9',
                                                    cursor: 'pointer'
                                                }}
                                                className="text-muted px-2"
                                            >
                                                {ele}
                                            </pre>
                                            {index !== arr.length - 1 && (
                                                <hr style={{ margin: 0, borderTop: '1px solid gray' }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <div className="fw-bold">Output:
                                <div className="text-muted" style={{ border: "1px solid gray" }}>
                                    {ex.output?.split('\n').map((ele, index, arr) => (
                                        <React.Fragment key={`problem-output-${index}`}>
                                            <pre
                                                style={{
                                                    margin: 0,
                                                    padding: '4px 8px',
                                                    transition: 'background-color 0.3s ease',
                                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e9e9e9',
                                                    cursor: 'pointer'
                                                }}
                                                className="text-muted px-2"
                                            >
                                                {ele}
                                            </pre>
                                            {index !== arr.length - 1 && (
                                                <hr style={{ margin: 0, borderTop: '1px solid gray' }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            {ex.explaination && <div className="fw-bold">Explainations:</div>}
                            {ex.explaination && <div className="container mx-0">
                                <pre
                                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                                >
                                    {ex.explaination}
                                </pre>
                            </div>}
                        </div>
                    </div>
                ))}
            </div>
            <Testcases />;
            <TestcasesOuptut />
            <div ref={scrollRef} id="scroll-target"></div>
        </>
    );
}

export default ProblemDescription
