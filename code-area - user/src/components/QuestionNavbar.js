import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

const QuestionNavbar = () => {
  const { title } = useParams();
  const location = useLocation();
  const problemData = location.state?.problem; 

  return (
    <div>
      <nav className="navbar w-100">
        <div className="container-fluid d-flex p-0">
          <Link 
            className="btn btn-outline-success flex-grow-1 fw-bold blockquote" 
            to={`/problems/get-problem/${title}/description`}
            state={{ problem: problemData }} 
          >
            Description
          </Link>
          <Link 
            className="btn btn-outline-success flex-grow-1 fw-bold blockquote" 
            to={`/problems/get-problem/${title}/test-cases`}
            state={{ problem: problemData }}
          >
            Test Cases
          </Link>
          <Link 
            className="btn btn-outline-success flex-grow-1 fw-bold blockquote" 
            to={`/problems/get-problem/${title}/verdict`}
            state={{ problem: problemData }}
          >
            Verdict
          </Link>
          <Link 
            className="btn btn-outline-success flex-grow-1 fw-bold blockquote" 
            to={`/problems/get-problem/${title}/your-submissions`}
            state={{ problem: problemData }}
          >
            My Submissions
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default QuestionNavbar;
