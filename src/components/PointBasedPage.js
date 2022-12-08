import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import { ListGroup, Button } from "react-bootstrap";
import "../css/PointBased.css";
import PointBasedModal from "./PointBasedModal";
import NavButton from "./NavButton";


export default function PointBasedPage(props) {

    const [userList, setUserList] = useState([]);
    const [showStartingScoreModal, setShowStartingScoreModal] = useState(true);
    const [startingScore, setStartingScore] = useState(0);

    const ref = useRef();

    const handleToggleStartingScoreModal = () => {
        setStartingScore(0);
        setShowStartingScoreModal(!showStartingScoreModal);
    };

    const handleSetStartingScore = event => {
        setStartingScore(event.target.value);
    };

    const handleConfirmStartingScore = () => {
        ref.current = startingScore;
        handleToggleStartingScoreModal();
    };


    return (
        <div id="ordered-list">
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Button className="mt-2 position-absolute start-50 translate-middle-x">End Round</Button>
            <i onClick={handleToggleStartingScoreModal} id="addItem" className="bi bi-plus-circle-fill position-absolute end-0"></i>

            <PointBasedModal show={showStartingScoreModal} setStartingScore={handleSetStartingScore} toggle={handleToggleStartingScoreModal} confirmScore={handleConfirmStartingScore}></PointBasedModal>
            <div id="list-container">
                <ListGroup as="ol" numbered>
                    <ListGroup.Item as="li">test</ListGroup.Item>
                    <ListGroup.Item as="li">test</ListGroup.Item>
                    <ListGroup.Item as="li">test</ListGroup.Item>
                    <ListGroup.Item as="li">test</ListGroup.Item>
                </ListGroup>
            </div>
        </div>
    );
}