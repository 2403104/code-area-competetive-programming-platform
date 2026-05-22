import React, { useEffect, useState, useContext } from 'react'
import ContestContext from '../../../myContext/contest/ContestContext';
const Testcases = () => {
    const { testcase, setTestcase } = useContext(ContestContext);
    const handleChange = (e) => {
        setTestcase(e.target.value);
    };
    console.log("Testcase " + testcase);
    return (
        <div>
            <div className="container">
                <form>
                    <div className="mb-3">
                        <h4 htmlFor="testCases" className="form-label fw-bold mb-0 mb-1">Sample Testcase </h4>
                        <textarea
                            type="text"
                            className="form-control p-3 "
                            id="testCases"
                            style={{ height: "30vh" }}
                            value={testcase}
                            onChange={handleChange}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Testcases
