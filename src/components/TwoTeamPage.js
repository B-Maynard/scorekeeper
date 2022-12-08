import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";
import NavButton from "./NavButton";
import {Link} from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function TwoTeamPage(props) {

    const [teamOnePoints, setTeamOnePoints] = useState(0);
    const [teamTwoPoints, setTeamTwoPoints] = useState(0);

    const [showEdit, setShowEdit] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem('twoTeamScores')) {
            let currentScores = JSON.parse(window.localStorage.getItem('twoTeamScores'));

            setTeamOnePoints(currentScores.teamOne);
            setTeamTwoPoints(currentScores.teamTwo);
        }
    }, []);


    const handleTeamOneScoreChange = (addition) => {

        let newTeamOneScore = 0;

        if (addition)
            newTeamOneScore = teamOnePoints + 1;
        else
            newTeamOneScore = teamOnePoints - 1;

        let currentScores = {
            teamOne: newTeamOneScore,
            teamTwo: teamTwoPoints
        };

        setTeamOnePoints(newTeamOneScore);


        window.localStorage.setItem("twoTeamScores", JSON.stringify(currentScores));
    };

    const handleTeamTwoScoreChange = (addition) => {

        let newTeamTwoScore = 0;

        if (addition)
            newTeamTwoScore = teamTwoPoints + 1;
        else
            newTeamTwoScore = teamTwoPoints - 1;

        let currentScores = {
            teamOne: teamOnePoints,
            teamTwo: newTeamTwoScore
        };

        setTeamTwoPoints(newTeamTwoScore);


        window.localStorage.setItem("twoTeamScores", JSON.stringify(currentScores));
    };

    return (
        <div>
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Link to="/multiteam">{<Button id="multiModeButton" className="mt-2 position-absolute start-50 translate-middle-x">Multi Team Mode</Button>}</Link>
            {/* Whether or not we want to show the edit options */}
            <i onClick={() => setShowEdit(!showEdit)} className="bi bi-pencil-square position-absolute end-0 me-4"></i>

            {/* If we have the edit options, don't allow the player to click in the screen to increase the score */}
            <div onClick={!showEdit ? () => handleTeamOneScoreChange(true) : null} id="team1" className="col-6">
                <div className="points position-absolute top-50 start-50 translate-middle">
                    {teamOnePoints}
                </div>
                {showEdit ? <i onClick={() => handleTeamOneScoreChange(false)} className="bi bi-arrow-down-square position-absolute top-50 translate-middle edit-arrow"></i> : null}
                {showEdit ? <i onClick={() => handleTeamOneScoreChange(true)} className="bi bi-arrow-up-square position-absolute top-50 translate-middle end-0 edit-arrow"></i> : null}
            </div>
            <div onClick={!showEdit ? () => handleTeamTwoScoreChange(true) : null} id="team2" className="col-6">
                <div className="points position-absolute top-50 start-50 translate-middle">
                    {teamTwoPoints}
                </div>
                {showEdit ? <i onClick={() => handleTeamTwoScoreChange(false)} className="bi bi-arrow-down-square position-absolute top-50 translate-middle edit-arrow"></i> : null}
                {showEdit ? <i onClick={() => handleTeamTwoScoreChange(true)} className="bi bi-arrow-up-square position-absolute top-50 translate-middle end-0 edit-arrow"></i> : null}
            </div>
        </div>
    );
}