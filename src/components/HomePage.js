import React, {useState, useEffect} from "react";
import HomeCard from "./HomeCard";

export default function HomePage(props) {

    // The different kinds of scoring
    // linkComponent is the link path we want to pass once we press "Play"

    return (
        <div className="container text-center">
            <div className="row">
                <HomeCard cardTitle="Point-Based Score Keeping" cardText="Useful in card games when you need to keep track of new points round-to-round." />
                <HomeCard linkComponent="twoteam" cardTitle="Team-Based Score Keeping" cardText="Typical team-based scoring, can go up to whatever score is required." />
            </div>
        </div>
    );
}