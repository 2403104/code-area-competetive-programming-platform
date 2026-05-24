import React, { useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom';
import ProblemCard from './ProblemCard';
import ProblemContext from '../myContext/problem/ProblemContext';
const Problems = () => {
  const context = useContext(ProblemContext);
  const { problems, getProblems, subList, getUser } = context;
  useEffect(() => {
    getProblems();
    getUser();
  }, [])

  console.log(subList)
  return (
    <div className="container mx-0 flex flex-col min-h-screen" style={{ cursor: "pointer", width: "75vw" }}>
      <div className="flex-grow">
        {problems.map((problem, idx) => (
          <ProblemCard key={problem._id} data={problem} idx={idx}/>
        ))}
      </div>
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-8">
        🌟 Keep pushing forward — every solved problem makes you stronger! 🌟
      </footer>
    </div>
  )
}

export default Problems
