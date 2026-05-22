import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';

const PutTestCases = () => {
    const location = useLocation();
    const context = useContext(ProblemContext);
    const { testCases, setTestCases, getTestCases } = context;
    const { title, _id } = location.state || {};

    useEffect(() => {
        if (title && _id) {
            getTestCases(title, _id);
        }
    }, [title, _id]);

    const handleChange = (e) => {
        setTestCases(e.target.value);
    };
    console.log(testCases)
    return (
        <div className="container">
            <form>
                <div className="mb-3">
                    <h4 htmlFor="testCases" className="form-label fw-bold mb-0 mb-1">Sample Testcase </h4>
                    <textarea
                        type="text"
                        className="form-control p-3 "
                        id="testCases"
                        style={{ height: "30vh" }}
                        value={testCases}
                        onChange={handleChange}
                    />
                </div>
            </form>
        </div>
        
    );
};

export default PutTestCases;
