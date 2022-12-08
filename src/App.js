import React from "react";
import HomePage from "./components/HomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TeamBasedPage from "./components/TeamBasedPage";
import TwoTeamPage from "./components/TwoTeamPage";
import PointBasedPage from "./components/PointBasedPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/multiteam" element={<TeamBasedPage />}></Route>
          <Route path="/twoteam" element={<TwoTeamPage />}></Route>
          <Route path="/points" element={<PointBasedPage />}></Route>
          <Route path="/" element={<HomePage />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
