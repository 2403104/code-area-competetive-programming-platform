import React, { useContext, useEffect, useState } from 'react';
import TestCasesStatsBox from './TestCasesStatsBox';
import ProblemContext from '../myContext/problem/ProblemContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import HorizonalLoader from './HorizontalLoader'
// require('dotenv').config(); 
// import dotenv from "dotenv";

const TestCasesStats = () => {
    const context = useContext(ProblemContext);
    const {
        setSResult,
        getUser,
        sResult,
        loading,
        runningTestCaseIndex,
        setRunningTestCaseIndex,
        submissionId,
        language,
        subList,
        id
    } = context;

    const [copySuccess, setCopySuccess] = useState('');
    const [codeViewStatus, setCodeViewStatus] = useState(false);
    const thisProbId = id;

    const filteredSubmissions = subList
        .filter(sub => sub?.problemId === thisProbId)
        .sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));

    const handleView = () => {
        setCodeViewStatus(!codeViewStatus);
    };

    useEffect(() => {
        getUser();
        if (filteredSubmissions.length === 0) {
            setSResult(null);
        }

        if ((!sResult || !sResult.verdicts || sResult.verdicts.length === 0) && filteredSubmissions.length > 0) {
            setSResult(filteredSubmissions[0]);
        }
    }, [subList, id]);

    // const getRunningTestcaseIndex = async (submissionId) => {
    //     try {
    //         const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || "http://localhost:3002";
    //         const get_testcase_index_url = `${JUDGE_BACKEND_URL}/submission/progress/${submissionId}`;          
    //         const response = await fetch(get_testcase_index_url);
    //         const contentType = response.headers.get("content-type");
    //         if (contentType && contentType.includes("application/json")) {
    //             const data = await response.json();
    //             return data.runningTestcase;
    //         } else {
    //             return runningTestCaseIndex;
    //         }
    //     } catch (error) {
    //         return runningTestCaseIndex;
    //     }
    // };

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(sResult.code[0]?.sourceCode || '')
            .then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            })
            .catch(err => { });
    };

    // useEffect(() => {
    //     const interval = setInterval(async () => {
    //         const index = await getRunningTestcaseIndex(submissionId);
    //         setRunningTestCaseIndex(index);
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, [submissionId]);

    if (!loading) {
        return (
            <div className="container d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <div className="d-flex align-items-center gap-3">
                    {runningTestCaseIndex === -1 
                        ? <h4 className="text-secondary mb-0">Queued...</h4>
                        : <h4 className="text-secondary mb-0">Running on testcase {runningTestCaseIndex}...</h4>
                    }
                    <HorizonalLoader />
                </div>
            </div>

        );
    }

    if (!sResult || (!sResult.verdicts && !sResult.errType)) {
        return (
            <div className="container">
                <h2 className="text-warning">No Submission Yet.</h2>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '10px' }}>
            <h1 className={`text-${sResult.status === "Accepted" ? "success" : "danger"}`}>{sResult.status}</h1>

            {sResult.errType !== "" ? (
                <div className="container mt-0 p-3" style={{ backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                    <h1 className="text-danger mb-3">{sResult.errType}</h1>
                    <h4>Runtime : {sResult.time} ms</h4>
                    <div className="container mt-3" onClick={handleView}>
                        <span className="blockquote px-2 py-1" style={{ cursor: "pointer", background: "#f5f5f5", borderRadius: '4px' }}>
                            {codeViewStatus ? 'Close Source Code' : 'View Source Code'}
                        </span>
                        {codeViewStatus && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Code:</h5>
                                    <button onClick={handleCopy} className="btn btn-sm btn-outline-primary">
                                        {copySuccess ? copySuccess : 'Copy'}
                                    </button>
                                </div>
                                <SyntaxHighlighter language={language || 'cpp'} style={coy}>
                                    {sResult.code[0]?.sourceCode || ''}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <h5>Error Message:</h5>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                            {sResult.errMessage}
                        </pre>
                    </div>
                </div>
            ) : (
                <>
                    <h4>Runtime : {sResult.time} ms</h4>
                    <div className="container mt-4" onClick={handleView}>
                        <span className="blockquote px-2 py-1" style={{ cursor: "pointer", background: "#f5f5f5", borderRadius: '4px' }}>
                            {codeViewStatus ? 'Close Source Code' : 'View Source Code'}
                        </span>
                        {codeViewStatus && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Code:</h5>
                                    <button onClick={handleCopy} className="btn btn-sm btn-outline-primary">
                                        {copySuccess ? copySuccess : 'Copy'}
                                    </button>
                                </div>
                                <SyntaxHighlighter language={language || 'cpp'} style={coy}>
                                    {sResult.code[0]?.sourceCode || ''}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>
                    {sResult.verdicts.map((stat, idx) => (
                        <div key={idx} className="mt-4">
                            <TestCasesStatsBox stat={stat} idx={idx} />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default TestCasesStats;
