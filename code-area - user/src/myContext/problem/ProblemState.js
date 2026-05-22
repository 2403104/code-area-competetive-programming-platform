import React, { useState } from 'react';
import ProblemContext from './ProblemContext';
import judge0Languages from '../../judge0code';

const ProblemState = (props) => {
    const [showNavbar,setShowNavbar]=useState(true);
    const [problems, setProblems] = useState([]);
    const [title,setTitle]=useState("");
    const [id,setId]=useState("");
    const [problem, setProblem] = useState({});
    const [testCases, setTestCases] = useState("");
    const [testCasesOutput, setTestCasesOutput] = useState({ output:"",time:"",errType:"",errMessage:"" });
    const [sResult, setSResult] = useState({ status: "", code: "", time: 0,errType:"",errMessage:"", verdicts: [] });
    const [code, setCode] = useState(judge0Languages["cpp"].template || "//Type Your Code Here");
    const [loading, setLoading] = useState(true);
    const [runningTestCaseIndex, setRunningTestCaseIndex] = useState(1);
    const [submissionId, setSubmissionId] = useState("");
    const [subList, setSubList] = useState([
        {
            problemId: "",
            code: [
                {
                    language: "",
                    sourceCode: ""
                }
            ],
            status: "",
            errType:"",
            errMessage:"",
            time: 0,
            verdicts: [
                {
                    Input: "",
                    Output: "",
                    Expected: "",
                    Verdict: "",
                    checkerLogs:"",
                    time: 0
                }
            ]
        }
    ]);
    const getUser =async () => {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const getUserUrl = `${BACKEND_URL}/auth/codearea-getuser`;
        const token=localStorage.getItem('auth-token');
        // console.log("Token : "+token)
        const userGetRes = await fetch(getUserUrl, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token
            }
        });
        const userData=await userGetRes.json();
        setSubList(userData.submissionList);
    }
    const getProblem = async (problemTitle, problemId) => {
        try {
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${BACKEND_URL}/problems/get-problem/${problemTitle}/${problemId}`);
            if (!response.ok) throw new Error("Failed to fetch problem");
            const data = await response.json();
            setProblem(data);
        } catch (err) {
            console.log("Error fetching problem:", err);
        }
    };

    const getProblemByTitle = async (title) => {
        try {
            const BACKEND_URL2 = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${BACKEND_URL2}/problems/get-problem/${title}`);
            if (!response.ok) throw new Error("Failed to fetch problem by title");
            const data = await response.json();
            setProblem(data);
        } catch (err) {
            console.log("Error fetching problem by title:", err);
        }
    };

    const getTestCases = async (problemTitle, problemId) => {
        try {
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${BACKEND_URL}/problems/get-problem/${problemTitle}/${problemId}`);
            if (!response.ok) throw new Error("Failed to fetch testcases");
            const data = await response.json();
            setTestCases(data.sampleTestCases[0]?.input || "");
        } catch (err) {
            console.log("Error fetching test cases:", err);
        }
    };

    const getProblems = async () => {
        try {
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${BACKEND_URL}/problems/get-all-problems`);
            if (!response.ok) throw new Error("Failed to fetch problems");
            const data = await response.json();
            setProblems(data);
        } catch (err) {
            console.log("Error fetching problems:", err);
        }
    };

    return (
        <ProblemContext.Provider value={{
            getProblemByTitle, problems,
            getProblems, testCases,
            getTestCases, setTestCases,
            testCasesOutput, setTestCasesOutput,
            problem, setProblem,
            getProblem, sResult,
            setSResult, code,
            setCode, loading,
            setLoading, runningTestCaseIndex,
            setRunningTestCaseIndex, submissionId,
            setSubmissionId, subList,
            setSubList, getUser,
            title,setTitle,
            id,setId,
            showNavbar,setShowNavbar
        }}>
            {props.children}
        </ProblemContext.Provider>
    );
};

export default ProblemState;
