import { useContext } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProblemSet from './components/ProblemSet';
import Contest from './components/contest/Contest';
import Discussions from './components/Discussions';
import ProblemWrapper from './components/ProblemWrapper';
import Description from './components/QuesNavEle/Description'
import Verdict from './components/QuesNavEle/Verdict'
import YourSubmissions from './components/QuesNavEle/YourSubmissions'
import TestCases from './components/QuesNavEle/TestCases';
import ProblemState from './myContext/problem/ProblemState'
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ShowContestDetails from './components/contest/ShowContestDetails';
import ProblemContext from './myContext/problem/ProblemContext';
import ContestProblems from './components/contest/ContestProblems';
import ContestState from './myContext/contest/ContestState';
import WriteCode from './components/contest/SolveProblems/WriteCode';
import MySubmission from './components/contest/MySubmission';
import CurrentStandings from './components/contest/CurrentStandings';
import ContestLayout from './components/contest/ContestLayout';
import UserProfile from './components/UserProfile';
import ProtectedContestRoute from './components/contest/ProtectedContestRoute';
import FinalStandings from './components/contest/FinalStandings';
import Announcements from './components/contest/Announcements';
const AppContent = () => {
  const { showNavbar } = useContext(ProblemContext);
  return (
    <>
      {showNavbar && <Navbar />}
      {/* {!showNavbar && <ContestNavbar />} */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<ProblemSet />} />
          <Route path="/contest" element={<Contest />} />
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/auth/codearea-login" element={<LoginPage />} />
          <Route path="/auth/codearea-signup" element={<SignupPage />} />

          <Route path="/problems/get-problem/:title" element={<ProblemWrapper />} />
          <Route path="/problems/get-problem/:title/description" element={<Description />} />
          <Route path="/problems/get-problem/:title/test-cases" element={<TestCases />} />
          <Route path="/problems/get-problem/:title/verdict" element={<Verdict />} />
          <Route path="/problems/get-problem/:title/your-submissions" element={<YourSubmissions />} />

          <Route path="/contest/contest-details/:id" element={<ShowContestDetails />} />

          <Route path="/compete-contest" element={<ContestLayout />}>
            <Route path="contest-problems/:id" element={
              <ProtectedContestRoute>
                <ContestProblems />
              </ProtectedContestRoute>
            } />
            <Route path="contest-problems/:id/:problemId" element={
              <ProtectedContestRoute>
                <WriteCode />
              </ProtectedContestRoute>
            } />
            <Route path="my-submissions/:id/:username" element={
              <ProtectedContestRoute>
                <MySubmission />
              </ProtectedContestRoute>
            } />
            <Route path="current-standings/:id" element={
              <ProtectedContestRoute>
                <CurrentStandings/>
              </ProtectedContestRoute>
            } />
            <Route path="announcements/:id" element={ 
              <ProtectedContestRoute>
                <Announcements />
              </ProtectedContestRoute>
            } />
          </Route>

          <Route path="/code-area/profile/:username" element={<UserProfile />} />
          <Route path="/compete-contest/final-standings/:id" element={<FinalStandings />} />

        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ProblemState>
      <ContestState>
        <Router>
          <AppContent />
        </Router>
      </ContestState>
    </ProblemState>
  );
}

export default App;