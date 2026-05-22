import React, { useState } from 'react';
// require('dotenv').config(); 
// import dotenv from "dotenv";

const AddProblem = () => {
    const [hiddenTestcases, setHiddenTestcases] = useState([]);
    const [checkerCode, setCheckerCode] = useState('');

    const addHiddenTestcase = () => {
        setHiddenTestcases([...hiddenTestcases, { input: '', expected: '' }]);
    };

    const deleteHiddenTestcase = (idx) => {
        const temp = hiddenTestcases.filter((_, i) => i !== idx);
        setHiddenTestcases(temp);
    };

    const handleHiddenTestcaseChange = (index, field, value) => {
        const temp = [...hiddenTestcases];
        temp[index][field] = value;
        setHiddenTestcases(temp);
    };

    const handleSubmision = async (e) => {
        e.preventDefault();
        const problemData = {
            QNo: 0,
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            difficulty: document.getElementById("difficulty").value,
            inputFormat: document.getElementById("inputFormat").value,
            outputFormat: document.getElementById("outputFormat").value,
            constraints: document.getElementById("constraints").value.split('\n'),
            topics: document.getElementById("topics").value.split('\n'),
            timeLimit: document.getElementById("timeLimit").value,
            memoryLimit: document.getElementById("memoryLimit").value,
            checkerCode: checkerCode,
            sampleTestCases: [
                {
                    input: document.getElementById("input1").value,
                    output: document.getElementById("output1").value,
                    explaination: document.getElementById("explaination1").value
                },
                {
                    input: document.getElementById("input2").value,
                    output: document.getElementById("output2").value,
                    explaination: document.getElementById("explaination2").value
                }
            ],
            testcases: hiddenTestcases
        };
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const url = `${backendUrl}/admin/add-problem`
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(problemData)
            });
            const data = await res.json();
            alert("Problem added.");

            document.querySelectorAll('textarea').forEach(el => el.value = '');
            setCheckerCode('');
            setHiddenTestcases([]);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to Add Problem.');
        }
    };
    
    return (
        <div className="container mt-4 p-4 shadow rounded bg-light">
            <h1 className="text-center text-primary">Add Problem</h1>
            <form onSubmit={handleSubmision}>
                <div className="mb-3">
                    <label htmlFor="title"><h5>Problem Title</h5></label>
                    <textarea className="form-control" id="title" rows="1" />
                </div>

                <div className="mb-3 d-flex align-items-center">
                    <label htmlFor="difficulty" className="me-3 mt-2"><h5>Difficulty</h5></label>
                    <textarea className="form-control w-25" id="difficulty" rows="1" />
                </div>

                <div className="container d-flex">
                    <div className="mb-3 d-flex align-items-center">
                        <label htmlFor="timeLimit" className="me-3 mt-2"><h5>Time Limit (seconds)</h5></label>
                        <textarea className="form-control w-25" id="timeLimit" rows="1" />
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                        <label htmlFor="memoryLimit" className="me-3 mt-2"><h5>Memory Limit (MB)</h5></label>
                        <textarea className="form-control w-25" id="memoryLimit" rows="1" />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="description"><h5>Problem Description</h5></label>
                    <textarea className="form-control" id="description" rows="8" />
                </div>

                <div className="mb-3 d-flex justify-content-between">
                    <div className="w-50 me-2">
                        <label htmlFor="inputFormat"><h5>Input Format</h5></label>
                        <textarea className="form-control" id="inputFormat" rows="6" />
                    </div>
                    <div className="w-50 ms-2">
                        <label htmlFor="outputFormat"><h5>Output Format</h5></label>
                        <textarea className="form-control" id="outputFormat" rows="6" />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="constraints"><h5>Problem Constraints</h5></label>
                    <textarea className="form-control" id="constraints" rows="2" />
                </div>

                <div className="mb-3">
                    <label htmlFor="topics"><h5>Topics related to this problem</h5></label>
                    <textarea className="form-control" id="topics" rows="2" />
                </div>

                <div className="mb-3">
                    <h4>Checker Code</h4>
                    <textarea
                        id="checkerCode"
                        className="form-control font-monospace"
                        style={{ fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '200px' }}
                        value={checkerCode}
                        onChange={(e) => setCheckerCode(e.target.value)}
                        placeholder={`#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your checker logic\n    return 0;\n}`}
                    />
                </div>

                <div className="mb-3">
                    <h5>Sample Testcase 1</h5>
                    <div className="d-flex justify-content-between">
                        <div className="w-50 me-2">
                            <label htmlFor="input1"><h6>Input</h6></label>
                            <textarea className="form-control" id="input1" rows="4" />
                        </div>
                        <div className="w-50 mx-2">
                            <label htmlFor="output1"><h6>Output</h6></label>
                            <textarea className="form-control" id="output1" rows="4" />
                        </div>
                        <div className="w-50 ms-2">
                            <label htmlFor="explaination1"><h6>Explanation</h6></label>
                            <textarea className="form-control" id="explaination1" rows="4" />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <h5>Sample Testcase 2</h5>
                    <div className="d-flex justify-content-between">
                        <div className="w-50 me-2">
                            <label htmlFor="input2"><h6>Input</h6></label>
                            <textarea className="form-control" id="input2" rows="4" />
                        </div>
                        <div className="w-50 mx-2">
                            <label htmlFor="output2"><h6>Output</h6></label>
                            <textarea className="form-control" id="output2" rows="4" />
                        </div>
                        <div className="w-50 ms-2">
                            <label htmlFor="explaination2"><h6>Explanation</h6></label>
                            <textarea className="form-control" id="explaination2" rows="4" />
                        </div>
                    </div>
                </div>

                <h4>Hidden Testcases</h4>
                {hiddenTestcases.map((testcase, index) => (
                    <div key={index} className="mb-3 p-3 border rounded bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Hidden Testcase {index + 1}</h5>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteHiddenTestcase(index)}>Delete</button>
                        </div>
                        <div className="container d-flex">
                            <div className="w-50 me-2">
                                <label><h6>Input</h6></label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={testcase.input}
                                    onChange={(e) => handleHiddenTestcaseChange(index, 'input', e.target.value)}
                                />
                            </div>
                            <div className="w-50 me-2">
                                <label><h6>Expected</h6></label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={testcase.expected}
                                    onChange={(e) => handleHiddenTestcaseChange(index, 'expected', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" className="btn btn-success mb-3" onClick={addHiddenTestcase}>Add Hidden Testcase</button>

                <div className="text-center mt-4">
                    <button type="submit" className="btn btn-primary px-4 py-2">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default AddProblem;
