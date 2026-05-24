import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import judge0Languages from '../judge0code';
import ProblemContext from '../myContext/problem/ProblemContext';
import { v4 as uuidv4 } from 'uuid';
// require('dotenv').config();
// import dotenv from "dotenv";

const CodeArea = () => {
    const navigate = useNavigate();
    const context = useContext(ProblemContext);
    const { testCases,
        getTestCases,
        setTestCasesOutput,
        problem,
        setSResult,
        code,
        setCode,
        setLoading,
        setRunningTestCaseIndex,
        loading,
        submissionId,
        setSubmissionId, sResult,
        subList,
        setSubList
    } = context;
    const { title, id } = useParams();
    const pollingRef = useRef(null);

    useEffect(() => {
        if (title && id) {
            getTestCases(title, id);
        }
    }, [title, id]);
    const isLoggedIn = localStorage.getItem("auth-token");
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const [language, setLanguage] = useState('cpp');

    const handleOnChange = (value) => {
        setCode(value);
    };

    const handlePretestRun = async () => {
        if (!isLoggedIn) {
            return alert("Login to submit code")
        }
        setLoading(false);
        navigate(`/problems/get-problem/${title}/test-cases`);
        try {
            const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || "http://localhost:3002";
            const judge_url = `${JUDGE_BACKEND_URL}/run`;
            const response = await fetch(judge_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userCode: code, language, input: testCases })
            });
            const res = await response.json();
            // console.log(res)
            const stat = {
                output: res.output || "",
                time: res.time || "0",
                errType: res.errType || "",
                errMessage: res.errMessage || ""
            };
            setTestCasesOutput(stat);
        } catch (error) {
            console.log("Error running pre-test:", error);
        }
        setLoading(true);
    };

    const handleSubmission = async () => {
        if (!isLoggedIn) {
            return alert("Login to submit code")
        }
        const newSubmissionId = uuidv4();
        setLoading(false);
        navigate(`/problems/get-problem/${title}/verdict`);
        setSubmissionId(newSubmissionId);
        setRunningTestCaseIndex(-1);
        startPolling(newSubmissionId);
            
        try {
            const timeLimit=problem?.timeLimit || 2;
            const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || "http://localhost:3002";
            const judge_url = `${JUDGE_BACKEND_URL}/judge`;            
            const response = await fetch(judge_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testcases: problem.testcases, checkerCode: problem.checkerCode, userCode: code, language,timeLimit , submissionId: newSubmissionId })
            });
            const res = await response.json();
            setSResult({
                status: res.status,
                code: [{ language, sourceCode: code }],
                time: res.time,
                errType: res.errType,
                errMessage: res.errMessage,
                verdicts: res.verdicts
            });
            const currSubmission = {
                problemId: problem._id,
                status: res.status,
                errType: res.errType,
                errMessage: res.errMessage,
                code: [{ language, sourceCode: code }],
                time: res.time,
                verdicts: res.verdicts
            }
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
            const subUrl = `${BACKEND_URL}/user/update-user`;
            const subRes = await fetch(subUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify(currSubmission)
            })
            const data = await subRes.json();
            if (data.success) {
                setSubList(prev => [currSubmission, ...prev]);
            }

        } catch (error) {
            console.log("Error during submission:", error);
        }
        setLoading(true);
    };


    const startPolling = (submissionId) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }
        const intervalId = setInterval(async () => {
            try {
                const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || "http://localhost:3002";
                const get_testcase_index_url = `${JUDGE_BACKEND_URL}/submission/progress/${submissionId}`;              
                const response = await fetch(get_testcase_index_url);
                const data = await response.json();

                if (data.runningTestcase > 0) {
                    setRunningTestCaseIndex(data.runningTestcase);
                }

                if (data.runningTestcase === 0) {
                    clearInterval(intervalId);
                    pollingRef.current = null;
                    setLoading(true);
                }
            } catch (error) {
                clearInterval(intervalId);
                pollingRef.current = null;
            }
        }, 300);
        pollingRef.current = intervalId;
    };    

    const handleLanguageChange = (e) => {
        const selectedLang = e.target.value;
        setLanguage(selectedLang);
        setCode(judge0Languages[selectedLang]?.template || "//Type your code here");
    };

    return (
        <div className="container-sm w-80">
            <div className="mb-3">
                <div className="container d-flex align-items-center justify-content-between">
                    <div className="text-success fw-bold mx-2">
                        <h4>&lt;/&gt; Code &lt;/&gt;</h4>
                    </div>
                    <div className="d-flex justify-content-end">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="form-select w-25 mx-2"
                        >
                            <option value="" disabled>Select Language</option>
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="javascript">Javascript</option>
                        </select>
                        <button type="button" onClick={handlePretestRun} className="btn btn-success mx-2 fw-bold">Run Testcases</button>
                        <button type="button" onClick={handleSubmission} className="btn btn-success mx-2 fw-bold">Submit</button>
                    </div>
                </div>
                <Editor
                    height="100vh"
                    width="100%"
                    theme='vs-light'
                    language={language}
                    value={code}
                    onChange={handleOnChange}
                    options={{
                        fontSize: 18,
                        minimap: { enabled: true },
                        automaticLayout: true,
                        formatOnType: true,
                        scrollBeyondLastLine: true
                    }}
                />
            </div>
        </div>
    );
};

export default CodeArea;
