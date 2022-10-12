import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";

export default function TeamBasedCard(props) {

    const [points, setPoints] = useState(0);

    // Sets up a bootstrap card and can manipulate points per card

    return (
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mt-5">
            <div className="card text-center">
                <div className="card-header h4 text-muted text-center">
                    {props.teamName}
                    <button className="btn-close fs-5 position-absolute end-0 me-2" type="button"></button>
                </div>
                <div id="team1-score" className="card-body fs-1 team-score-body">
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




