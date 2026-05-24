import React, { useContext, useEffect } from 'react'
import ProblemContext from '../../myContext/problem/ProblemContext';
import ContestNavbar from './ContestNavbar';
import ContestProblems from './ContestProblems';
import WriteCode from './SolveProblems/WriteCode';
import CurrentStandings from './CurrentStandings'
import { Outlet } from 'react-router-dom';
const ContestLayout = () => {
    const { setShowNavbar } = useContext(ProblemContext);
    useEffect(() => {
        setShowNavbar(false);
        return () => setShowNavbar(true);
    }, []);
    return (
        <div>
            <ContestNavbar/>
            <div className="container-fluid">
                <Outlet/>
            </div>
        </div>
    )
}

export default ContestLayout
