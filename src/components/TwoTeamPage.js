import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";
import NavButton from "./NavButton";
import {Link} from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function TwoTeamPage(props) {

    const [teamOnePoints, setTeamOnePoints] = useState(0);
    const [teamTwoPoints, setTeamTwoPoints] = useState(0);

    const [showEdit, setShowEdit] = useState(false);

    return (
        <div>
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Link to="/multiteam">{<Button id="multiModeButton" className="mt-2 position-absolute start-50 translate-middle-x">Multi Team Mode</Button>}</Link>
            <i onClick={() => setShowEdit(!showEdit)} className="bi bi-pencil-square position-absolute end-0 me-4"></i>

            <div onClick={!showEdit ? () => setTeamOnePoints(teamOnePoints + 1) : null} id="team1" className="col-6">
                <div className="points position-absolute top-50 start-50 translate-middle">
                    {teamOnePoints}
                </div>
                {showEdit ? <i onClick={() => setTeamOnePoints(teamOnePoints - 1)} className="bi bi-arrow-down-square position-absolute top-50 translate-middle edit-arrow"></i> : null}
                {showEdit ? <i onClick={() => setTeamOnePoints(teamOnePoints + 1)} className="bi bi-arrow-up-square position-absolute top-50 translate-middle end-0 edit-arrow"></i> : null}
            </div>
            <div onClick={() => setTeamTwoPoints(teamTwoPoints + 1)} id="team2" className="col-6">
                <div className="points position-absolute top-50 start-50 translate-middle">
                    {teamTwoPoints}
                </div>
                {showEdit ? <i onClick={() => setTeamTwoPoints(teamTwoPoints - 1)} className="bi bi-arrow-down-square position-absolute top-50 translate-middle edit-arrow"></i> : null}
                {showEdit ? <i onClick={() => setTeamTwoPoints(teamTwoPoints + 1)} className="bi bi-arrow-up-square position-absolute top-50 translate-middle end-0 edit-arrow"></i> : null}
            </div>
        </div>
    );
}