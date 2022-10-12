import React, {useState, useEffect} from "react";
import "../css/HomeCard.css";
import {Link} from "react-router-dom";

export default function HomeCard(props) {
    return (
        <div className="col-lg-4">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{props.cardTitle}</h5>
                    <p className="card-text">{props.cardText}</p>
                    <Link to={props.linkComponent} className="btn btn-primary">Play</Link>
                </div>
            </div>
        </div>
    );
}