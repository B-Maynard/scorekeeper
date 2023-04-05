import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import { ListGroup, Button, Badge } from "react-bootstrap";
import "../css/PointBased.css";
import PointBasedStartingScoreModal from "./PointBasedStartingScoreModal";
import NavButton from "./NavButton";
import PointBasedCard from "./PointBasedCard";
import TeamBasedModal from "./TeamBasedModal";
import EndRoundModal from "./EndRoundModal";

export default function PointBasedPage(props) {

    const [userList, setUserList] = useState([]);
    const [showStartingScoreModal, setShowStartingScoreModal] = useState(true);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showEndRoundModal, setShowEndRoundModal] = useState(false);
    const [startingScore, setStartingScore] = useState(0);
    const [currentUserName, setCurrentUserName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [highToLow, setHighToLow] = useState(true);

    const startingScoreRef = useRef();
    const highToLowRef = useRef();
    const userNameRef = useRef();

    useEffect(() => {

        if (window.localStorage.getItem('pointBasedUserInfo')) {
            setUserList(JSON.parse(window.localStorage.getItem('pointBasedUserInfo')));
        }

        if (window.localStorage.getItem('pointBasedStartingScore')) {
            let currentScoreJSON = JSON.parse(window.localStorage.getItem('pointBasedStartingScore'));

            setShowStartingScoreModal(false);
            setStartingScore(currentScoreJSON);
        }

        if (window.localStorage.getItem('highToLow')) {
            setHighToLow(JSON.parse(window.localStorage.getItem('highToLow')));
        }
    }, []);

    const placementClasses = {
        0: "first-place",
        1: "second-place",
        2: "third-place"
    };

    const handleToggleStartingScoreModal = () => {
        setStartingScore(0);
        setShowStartingScoreModal(!showStartingScoreModal);
    };

    const handleToggleEndRoundModal = () => {
      setShowEndRoundModal(!showEndRoundModal)   
    };

    const handleSetStartingScore = event => {
        setStartingScore(event.target.value);
    };

    const handleConfirmStartingScore = () => {
        startingScoreRef.current = startingScore;
        highToLowRef.current = highToLow;
        window.localStorage.setItem('pointBasedStartingScore', startingScoreRef.current);
        window.localStorage.setItem('highToLow', highToLowRef.current);
        handleToggleStartingScoreModal();
    };

    const handleNameChange = event => setCurrentUserName(event.target.value);

    const handleSetHighToLow = event => {
        setHighToLow(event.target.checked);
    } ;

    // Toggles whether or not to show the modal based on button click
    const handleToggleModal = () => {

        //Make sure to reset the error message if the modal is hidden and we're opening it
        if (!showTeamModal) setErrorMessage("");
        setCurrentUserName("");
        setShowTeamModal(!showTeamModal);
    }

    const handleAddNewUser = () => {
        let userName = currentUserName.trim();

        // This will happen if we are using the local storage value and haven't set a new starting score
        if (!startingScoreRef.current) {
            let currentStartingScore = JSON.parse(window.localStorage.getItem("pointBasedStartingScore"));
            startingScoreRef.current = currentStartingScore;
        }

        userNameRef.current = userName;
        let currentStorage = null;
        let key = 0;

        if (window.localStorage.getItem('pointBasedUserInfo')) {
            currentStorage = JSON.parse(window.localStorage.getItem('pointBasedUserInfo'));

            if (currentStorage.length > 0)
                key = (Math.max.apply(Math, currentStorage.map(function(user) { return user.key}))) + 1;
        }

        let newUserInfo = {
            key: key,
            score: startingScoreRef.current,
            userName: userNameRef.current
        };

        setUserList(userList => [...userList, newUserInfo]);

        if (currentStorage !== null) {
            currentStorage.push(newUserInfo);

            window.localStorage.setItem('pointBasedUserInfo', JSON.stringify(currentStorage));
        }
        else {
            let tempArray = [];
            tempArray.push(newUserInfo);
            window.localStorage.setItem('pointBasedUserInfo', JSON.stringify(tempArray));
        }
    };

    const handleArraySort = (currentStorage) => {

        if (highToLow)
            currentStorage.sort((a, b) => (a.score < b.score ? 1 : -1));
        else
            currentStorage.sort((a, b) => (a.score > b.score ? 1 : -1));

        setUserList(currentStorage);

        window.localStorage.setItem('pointBasedUserInfo', JSON.stringify(currentStorage));
    };

    return (
        <div id="ordered-list">
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Button id="end-round-button" className="mt-2 position-absolute start-50 translate-middle-x" onClick={handleToggleEndRoundModal}>End Round</Button>
            <Button onClick={handleToggleStartingScoreModal} id="reset-score-button" className="mt-2 position-absolute start-50 translate-middle-x">Reset Starting Score</Button>
            <i onClick={handleToggleModal} id="addItem" className="bi bi-plus-circle-fill position-absolute end-0"></i>

            <PointBasedStartingScoreModal show={showStartingScoreModal} setStartingScore={handleSetStartingScore} toggle={handleToggleStartingScoreModal} confirmScore={handleConfirmStartingScore} startingScore={startingScoreRef.current} highToLowCheck ={handleSetHighToLow} highToLowValue={highToLow}></PointBasedStartingScoreModal>

            <TeamBasedModal errorMsg={errorMessage} toggle={handleToggleModal} show={showTeamModal} name={handleNameChange} addCard={handleAddNewUser} title="Enter User Name:" />

            <EndRoundModal userList={userList} show={showEndRoundModal} toggle={handleToggleEndRoundModal}></EndRoundModal>

            <div id="list-container">
                {
                    userList.map((item, index) => {
                        return (
                            <PointBasedCard key={item.key} placement={index in placementClasses ? placementClasses[index] : "other-place"} numberPlacement={index + 1} userName={item.userName} score={item.score} keyValue={item.key} arraySort={handleArraySort} setUserList={setUserList}/>
                        );
                    })
                }
            </div>
        </div>
    );
}