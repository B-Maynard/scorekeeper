import React, {useState, useEffect, useRef} from "react";
import "../css/PointBased.css";
import ConfirmModal from "./ConfirmModal";
import EditScoreModal from "./EditScoreModal";

export default function PointBasedCard(props) {

    const [confirmToggle, setConfirmToggle] = useState(false);
    const [confirmAnswer, setConfirmAnswer] = useState(false);
    const [scoreChangeToggle, setScoreChangeToggle] = useState(false);
    const [scoreChange, setScoreChange] = useState(0);

    const scoreChangeRef = useRef();

    const handleConfirmToggle = () => {
        setConfirmToggle(!confirmToggle);
    };

    const handleScoreChangeToggle = () => {
        setScoreChangeToggle(!scoreChangeToggle);
    };

    const displayNone = {
        display: "none"
    };

    const handleConfirmAnswer = () => {
        setConfirmAnswer(true);

        let currentStorage = JSON.parse(window.localStorage.getItem("pointBasedUserInfo"));
        let newStorage = currentStorage.filter(obj => obj.key != props.keyValue);

        props.arraySort(newStorage);

        handleConfirmToggle();
    };

    const handleSetScoreChange = event => {
        setScoreChange(event.target.value);
    };

    const handleAddScore = () => {
        scoreChangeRef.current = scoreChange;

        let currentStorage = JSON.parse(window.localStorage.getItem("pointBasedUserInfo"));

        currentStorage.map((item) => {
            if (item.key == props.keyValue) {
                item.score = +item.score + +scoreChangeRef.current;
            }
        });

        props.arraySort(currentStorage);

        handleScoreChangeToggle();
    };

    const handleSubtractScore = () => {
        scoreChangeRef.current = scoreChange;

        let currentStorage = JSON.parse(window.localStorage.getItem("pointBasedUserInfo"));

        currentStorage.map((item) => {
            if (item.key == props.keyValue) {
                item.score -= scoreChangeRef.current;
            }
        });

        props.arraySort(currentStorage);

        handleScoreChangeToggle();
    };

    // Sets up a bootstrap card and can manipulate points per card

    return (
        <div style={confirmAnswer ? displayNone : null} className={`${props.placement} card text-center`}>
            <ConfirmModal toggle={handleConfirmToggle} show={confirmToggle} bodyText="Are you sure you want to remove this team?" confirm={handleConfirmAnswer}></ConfirmModal>
            <EditScoreModal show={scoreChangeToggle} toggle={handleScoreChangeToggle} userName={props.userName} setScoreChange={handleSetScoreChange} addScore={handleAddScore} subtractScore={handleSubtractScore} isEndOfRound={false}></EditScoreModal>
            <div className="card-header">
            <i onClick={handleScoreChangeToggle} className="bi bi-pencil-square position-absolute start-0 fs-3"></i>
                {props.numberPlacement}. {props.userName}
                <button onClick={handleConfirmToggle} id="close-button" className="btn-close fs-5 position-absolute end-0 me-2" type="button"></button>
            </div>
            <div className="card-body">
                {props.score}
            </div>
        </div>
        
    );
}




