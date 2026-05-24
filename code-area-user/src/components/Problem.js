import React, { useContext } from 'react';
import ProblemContext from '../myContext/problem/ProblemContext';

const Problem = () => {
    const { problem, setTitle, setId } = useContext(ProblemContext);
    const sample = problem || {};

    setTitle(sample.title);
    setId(sample._id);

    return (
        <div className="container mt-2 mx-0 w-100">
            <h3 className="fw-bold text-muted">{sample?.title}</h3>
            <h4 className={`card-text fw-bold mx-1 text-${(sample?.difficulty === "Hard") ? "danger" : (sample?.difficulty === "Medium") ? "warning" : "success"}`}>
                {sample?.difficulty}
            </h4>
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
                {sample?.description}
            </pre>

            <div className="container mx-0">
                <div className="fw-bold blockquote">Input Type</div>
                <pre
                    className="blockquote"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                >
                    {sample?.inputFormat}
                </pre>
            </div>

            <div className="container mx-0">
                <div className="fw-bold blockquote">Output Type</div>
                <pre
                    className="blockquote"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}
                >
                    {sample?.outputFormat}
                </pre>
            </div>

            <div className="container mx-0">
                <div className="fw-bold blockquote">Constraints</div>
                <p className="blockquote mx-3">
                    {sample?.constraints?.map((constraint, index) => (
                        <span key={`constraints-${index}`}>
                            {constraint}<br />
                        </span>
                    ))}
                </p>
            </div>

            {sample?.sampleTestCases?.map((ex, idx) => (
                <div key={`sample-${idx}`} className="fw-bold blockquote">
                    Sample Test Case {idx + 1}
                    <div className="container">
                        <div className="fw-bold">Input:
                            <div className="text-muted" style={{ border: "1px solid gray" }}>
                                {ex.input?.split('\n').map((ele, index, arr) => (
                                    <React.Fragment key={`sample-input-${index}`}>
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
                                    <React.Fragment key={`sample-output-${index}`}>
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

            <div className="fw-bold blockquote"><h3>Topics</h3></div>
            <div className="fw-bold blockquote d-flex">
                {sample?.topics?.map((ele, idx) => (
                    <span key={`topics-${idx}`} className="badge rounded-pill text-bg-secondary mx-1 mt-1">
                        <h6 className="mt-0">{ele}</h6>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Problem;
