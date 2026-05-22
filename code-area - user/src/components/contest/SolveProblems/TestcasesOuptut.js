import React,{useContext} from 'react'
import ContestContext from '../../../myContext/contest/ContestContext';
const TestcasesOuptut = () => {
    const {loading,testCasesOutput}=useContext(ContestContext);
    return (
        <div className="container">
            <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                    <h4 className="form-label fw-bold mb-0">Testcase Result</h4>
                    {loading ? (
                        <div className="spinner-border text-secondary ms-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <h5 className="form-label fw-bolder mb-0 mx-2" >({`${testCasesOutput?.time || 0}ms` || ""})</h5>
                    )}
                </div>
                {testCasesOutput.errType ? (
                    <div className="container">
                        <h4>{testCasesOutput.errType}</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{testCasesOutput.errMessage}</pre>
                    </div>

                ) :
                    (
                        <textarea
                            type="text"
                            className="form-control p-3"
                            id="testCases"
                            style={{ height: "30vh" }}
                            value={testCasesOutput.output}
                            readOnly
                        />
                    )
                }

            </div>
        </div>
    );
}

export default TestcasesOuptut
