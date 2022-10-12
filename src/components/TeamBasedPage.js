import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";
import NavButton from "./NavButton";
import TeamBasedCard from "./TeamBasedCard";
import TeamBasedModal from "./TeamBasedModal";
import {Link} from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function TeamBasedPage(props) {

    const [showModal, setShowModal] = useState(true);
    const [cardList, setCardList] = useState([]);
    const [newTeamName, setNewTeamName] = useState("");

    // Toggles whether or not to show the modal based on button click
    const handleToggleModal = () => setShowModal(!showModal);
    // name change comes in on an input form which fires an event, which is why we grab it like this
    const handleNameChange = event => setNewTeamName(event.target.value);

    // appends the newest team card to the current list
    // makes the key whatever the length of the list is + 1 and then also toggles the modal
    const handleCardListChange = () => {
        setCardList([...cardList, <TeamBasedCard key={cardList.length + 1} teamName={newTeamName} />]);
        handleToggleModal();
    };

    return (
        <div>
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Link to="/twoteam">{<Button className="mt-2 position-absolute start-50 translate-middle-x">Two Team Mode</Button>}</Link>
            <i id="addTeam" onClick={handleToggleModal} className="bi bi-plus-circle-fill position-absolute end-0"></i>

            <TeamBasedModal toggle={handleToggleModal} show={showModal} name={handleNameChange} addCard={handleCardListChange}></TeamBasedModal>
        
            <div id="cardsContainer">
                <div id="team-container-row" className="row">
                    {cardList}
                </div>
            </div>
        </div>
    );
}