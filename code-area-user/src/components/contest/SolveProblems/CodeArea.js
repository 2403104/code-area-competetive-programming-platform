import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ContestContext from '../../../myContext/contest/ContestContext';
import { useParams } from 'react-router-dom';

const CodeArea = () => {
  const naviage = useNavigate();
  const { id } = useParams();
  const username = localStorage.getItem('username');
  const { testcase, setTestCasesOutput, setLoading, scrollRef, problem, subList, setSubList ,setTempSubList,setSubmissionLoading} = useContext(ContestContext);
  const [language, setLanguage] = useState('');
  const [code, setCode] = useState('');

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const templates = {
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
      python: `def main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
      java: `public class Main {\n    public static void main(String[] args) {\n    }\n}`,
      javascript: `function main() {\n}\n\nmain();`
    };
    if(!code.trim()){
      setCode(templates[lang] || "");
    }else{
      setCode(code);
    }
  };

  const handleOnChange = (newCode) => {
    setCode(newCode);
  };

  useState(() => {
    setTestCasesOutput({ output: "", time: "", errType: "", errMessage: "" });
  })

  const handlePretestRun = async () => {
    setLoading(true);
    try {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });

      setTimeout(async () => {
        const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || 'http://localhost:3002';
        const response = await fetch(`${JUDGE_BACKEND_URL}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userCode: code, language, input: testcase })
        });
        const res = await response.json();

        const stat = {
          output: res.output || "",
          time: res.time || "0",
          errType: res.errType || "",
          errMessage: res.errMessage || ""
        };

        setTestCasesOutput(stat);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.log("Error running pre-test:", error);
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    const tempSubmission = {
      problemId: problem._id,
      code: [{ language, sourceCode: code }],
      status: "Running on testcases...",
      time: 0,
      errType: "",
      errMessage: "",
      verdicts: [], 
      submissionTime: new Date()
    };
    setTempSubList(prev => [tempSubmission, ...prev]);
    const newSubmissionId = "554ads5fa4sdf1asdfads5";
    const navUrl = `/compete-contest/my-submissions/${id}/${username}`;
    naviage(navUrl);
    setSubmissionLoading(true);
    const timeLimit=problem?.timeLimit || 2;
    try {
      const JUDGE_BACKEND_URL = process.env.REACT_APP_JUDGE_BACKEND_URL || 'http://localhost:3002';
      const response = await fetch(`${JUDGE_BACKEND_URL}/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testcases: problem.testcases, checkerCode: problem.checkerCode, userCode: code, language,timeLimit, submissionId: newSubmissionId })
      });
      const res = await response.json();
      const currSubmission = {
        ...tempSubmission,
        status: res.status,
        time: res.time,
        errType: res.errType,
        errMessage: res.errMessage,
        verdicts: res.verdicts
      }
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const subUrl = `${BACKEND_URL}/user/add-new-submission`;
      const subRes = await fetch(subUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({
          contestId: id,
          username: username,
          newSubmission: currSubmission
        })
      });

      const data = await subRes.json();
      console.log(data)
      if (data.success) {
        setTempSubList([]);
        setSubList(prev => [currSubmission, ...prev]);
      }
    } catch (error) {
      console.log("Error during submission:", error);
    }
    setSubmissionLoading(false);
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