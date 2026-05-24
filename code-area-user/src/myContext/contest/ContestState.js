import React, { useState, useRef } from 'react'
import ContestContext from './ContestContext'
const ContestState = (props) => {
    const [contest, setContest] = useState({})
    const [contestId, setContestId] = useState("")
    const [testCasesOutput, setTestCasesOutput] = useState({ output: "", time: "", errType: "", errMessage: "" });
    const [loading, setLoading] = useState(false);
    const [testcase, setTestcase] = useState("");
    const [problem, setProblem] = useState([]);
    const scrollRef = useRef(null);
    const [tempSubList, setTempSubList] = useState([]);
    const [submissionLoading,setSubmissionLoading]=useState(false);
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
            errType: "",
            errMessage: "",
            time: 0,
            verdicts: [
                {
                    Input: "",
                    Output: "",
                    Expected: "",
                    Verdict: "",
                    checkerLogs: "",
                    time: 0
                }
            ]
        }
    ]);
    const getSubmissionList = async (id,username) => {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const url = `${BACKEND_URL}/user/get-contest/${id}`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                let newSub = [];
                for (let sub of data.contest.submissions) {
                    if (sub.username === username) {
                        newSub.push(...sub.mySubmissions);
                    }
                }
                newSub.sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
                setSubList(newSub);
            } else {
                console.error('Failed to fetch contest:', data.error);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };
    const getContest = async (id) => {
        try {
            const BACKEND_URL2 = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
            const url = `${BACKEND_URL2}/user/get-contest/${id}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await res.json();
            setContest(data.contest);
        } catch (error) {
            console.error("Error fetching contest:", error);
        }
    }
    return (
        <ContestContext.Provider value={{
            contest, setContest,
            getContest,
            contestId, setContestId,
            loading, setLoading,
            testCasesOutput, setTestCasesOutput,
            testcase, setTestcase,
            scrollRef,
            problem, setProblem,
            subList, setSubList,
            getSubmissionList,
            tempSubList,setTempSubList,
            submissionLoading,setSubmissionLoading
        }} >
            {props.children}
        </ContestContext.Provider>
    )
}

export default ContestState
