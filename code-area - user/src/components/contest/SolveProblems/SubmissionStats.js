import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TestCasesStatsBox from '../../TestCasesStatsBox'

const SubmissionStats = ({ submission }) => {
    const [codeViewStatus, setCodeViewStatus] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    if (!submission) {
        return (
            <div className="container">
                <h2 className="text-warning">No Submission Available.</h2>
            </div>
        );
    }

    const handleView = () => {
        setCodeViewStatus(!codeViewStatus);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(submission.code[0]?.sourceCode || '');
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy!');
        }
    };

    return (
        <div className="container" style={{ padding: '10px' }}>
            <h1 className={`text-${submission.status === "Accepted" ? "success" : "danger"}`}>{submission.status}</h1>

            {submission.errType !== "" ? (
                <div className="container mt-0 p-3" style={{ backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                    <h1 className="text-danger mb-3">{submission.errType}</h1>
                    <h4>Runtime : {submission.time} ms</h4>
                    <div className="container mt-3" onClick={handleView}>
                        <span className="blockquote px-2 py-1" style={{ cursor: "pointer", background: "#f5f5f5", borderRadius: '4px' }}>
                            {codeViewStatus ? 'Close Source Code' : 'View Source Code'}
                        </span>
                        {codeViewStatus && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Code:</h5>
                                    <button onClick={handleCopy} className="btn btn-sm btn-outline-primary">
                                        {copySuccess || 'Copy'}
                                    </button>
                                </div>
                                <SyntaxHighlighter language={submission.code[0]?.language || 'cpp'} style={coy}>
                                    {submission.code[0]?.sourceCode || ''}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <h5>Error Message:</h5>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{submission.errMessage}</pre>
                    </div>
                </div>
            ) : (
                <>
                    <h4>Runtime : {submission.time} ms</h4>
                    <div className="container mt-4" onClick={handleView}>
                        <span className="blockquote px-2 py-1" style={{ cursor: "pointer", background: "#f5f5f5", borderRadius: '4px' }}>
                            {codeViewStatus ? 'Close Source Code' : 'View Source Code'}
                        </span>
                        {codeViewStatus && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Code:</h5>
                                    <button onClick={handleCopy} className="btn btn-sm btn-outline-primary">
                                        {copySuccess || 'Copy'}
                                    </button>
                                </div>
                                <SyntaxHighlighter language={submission.code[0]?.language || 'cpp'} style={coy}>
                                    {submission.code[0]?.sourceCode || ''}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>
                    {submission.verdicts.map((stat, idx) => (
                        <div key={idx} className="mt-4">
                            <TestCasesStatsBox stat={stat} idx={idx} />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default SubmissionStats;
