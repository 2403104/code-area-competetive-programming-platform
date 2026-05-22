import React from 'react';

const TestCasesStatsBox = ({stat,idx}) => {
    return (
        <div>
            <div className="card mt-4">
                <div className="card-body">
                    
                    <div className="fw-bold d-flex">
                        <h5 className="mx-0">#Testcase {idx+1}#</h5>
                        <h5 className="mx-4">Time : {stat.time}ms</h5>
                        <h5 className="mx-4">Verdict : {stat.Verdict} </h5>
                    </div>
                    <h6 className="mx-2">Judgment Status : {`${stat.Verdict==="ok"?"Accepted":stat.Verdict}`}</h6>

                    <h6 className="mt-2 mx-2">Input</h6>
                    <div className="card p-2 pt-0 pb-0">
                        <pre className=" mt-0 mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {stat["Input"]}
                        </pre>
                    </div>

                    <h6 className="mt-2 mx-2">Output</h6>
                    <div className="card p-2 pt-0 pb-0">
                        <pre className=" mt-0 mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {stat["Output"]}
                        </pre>
                    </div>

                    <h6 className="mt-2 mx-2">Expected</h6>
                    <div className="card p-2 pt-0 pb-0">
                        <pre className=" mt-0 mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {stat["Expected"]}
                        </pre>
                    </div>
                    <h6 className="mt-2 mx-2">Checker Logs</h6>
                    <div className="card p-2 pt-0 pb-0">
                        <pre className=" mt-0 mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {stat["checkerLogs"]}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCasesStatsBox;
