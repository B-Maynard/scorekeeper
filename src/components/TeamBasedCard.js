import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";
import ConfirmModal from "./ConfirmModal";

export default function TeamBasedCard(props) {

    const [points, setPoints] = useState(0);
    const [confirmToggle, setConfirmToggle] = useState(false);
    const [confirmAnswer, setConfirmAnswer] = useState(false);

    const cardStyle = {
        backgroundColor: props.bgColor
    };

    const displayNone = {
        display: "none"
    };

    const handleConfirmToggle = () => {
        setConfirmToggle(!confirmToggle);
    };

    const handleConfirmAnswer = () => {
        setConfirmAnswer(true);

        let currentStorage = JSON.parse(window.localStorage.getItem("cardListInfo"));
        let newStorage = currentStorage.filter(obj => obj.teamName != props.teamName);
        

        window.localStorage.setItem("cardListInfo", JSON.stringify(newStorage));


        handleConfirmToggle();
    };

    // Sets up a bootstrap card and can manipulate points per card

    return (
        <div style={confirmAnswer ? displayNone : null} className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mt-5">
            <ConfirmModal toggle={handleConfirmToggle} show={confirmToggle} bodyText="Are you sure you want to remove this team?" confirm={handleConfirmAnswer}></ConfirmModal>
            <div className="card text-center">
                <div className="card-header h4 text-muted text-center">
                    {props.teamName}
                    <button onClick={handleConfirmToggle} className="btn-close fs-5 position-absolute end-0 me-2" type="button"></button>
                </div>
                <div style={cardStyle} className="card-body fs-1 team-score-body">
                    {points}
                </div>
                <div className="row">
                    <div className="col-6">
                        <div onClick={() => setPoints(points + 1)} className="h5 text-muted">
                            <i className="bi bi-caret-up-fill position-absolute start-0"></i>
                        </div>
                    </div>
                    <div className="col-6">
                        <div onClick={() => setPoints(points - 1)} className="h5 text-muted">
                            <i className="bi bi-caret-down-fill float-end me-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
}




