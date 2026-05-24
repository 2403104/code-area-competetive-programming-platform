import React, { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ProblemContext from '../../myContext/problem/ProblemContext';
import ProblemWrapper from '../ProblemWrapper';

const Description = () => {
    const location = useLocation();
    const { getTestCases, setProblem } = useContext(ProblemContext);
    const problem = location.state?.problem;

    useEffect(() => {
        if (problem && problem.title && problem._id) {
            getTestCases(problem.title, problem._id);
            setProblem(problem);
        }
    }, [problem]);

    return (
        <div className='h-[91vh] w-[100vw] bg-black text-white flex justify-center items-center'>
            <style>{`
                ::-webkit-scrollbar {
                    display: none;
                }
                html {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <ProblemWrapper />
        </div>
    );
};

export default Description;
