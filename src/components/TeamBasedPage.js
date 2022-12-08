import React, {useState, useEffect, useRef} from "react";
import "../css/TeamBased.css";
import NavButton from "./NavButton";
import TeamBasedCard from "./TeamBasedCard";
import TeamBasedModal from "./TeamBasedModal";
import {Link} from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function TeamBasedPage(props) {

    const [cardListInfo, setCardListInfo] = useState([])
    const [newTeamName, setNewTeamName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const ref = useRef();


    useEffect(() => {
        let ignore = false;

        if (!ignore && window.localStorage.getItem('cardListInfo')) {
            setCardListInfo(JSON.parse(window.localStorage.getItem('cardListInfo')));
        }
        return () => { ignore = true; }
    }, []);


    // Toggles whether or not to show the modal based on button click
    const handleToggleModal = () => {

        //Make sure to reset the error message if the modal is hidden and we're opening it
        if (!showModal) setErrorMessage("");
        setNewTeamName("");

        setShowModal(!showModal);
    }
    // name change comes in on an input form which fires an event, which is why we grab it like this
    const handleNameChange = event => setNewTeamName(event.target.value);

    const randomColor = () => {
            let x = Math.floor(Math.random() * 256);
            let y = Math.floor(Math.random() * 256);
            let z = Math.floor(Math.random() * 256);
            return "rgba(" + x.toString() + "," + y.toString() + "," + z.toString() + "," + 0.5 + ")";
    } 

    // appends the newest team card to the current list
    // makes the key whatever the length of the list is + 1 and then also toggles the modal
    const addCardToList = () => {

        let teamName = newTeamName.trim();

        if (teamName == null || teamName == undefined || teamName == "") {
            setErrorMessage("Team Name cannot be blank.");
            return;
        }

        ref.current = teamName;

        let currentStorage = null;
        if (window.localStorage.getItem('cardListInfo')) {
            currentStorage = JSON.parse(window.localStorage.getItem('cardListInfo'));

            if (currentStorage.find(obj => obj.teamName === ref.current)) {
                setErrorMessage("Team name already exists.");
                setShowModal(true);
                return;
            }
            else {
                setErrorMessage("");
            }
        }

        let newCardInfo = new Object();
        newCardInfo = {
            bgColor: randomColor(),
            teamName: ref.current
        };

        setCardListInfo(cardListInfo => [...cardListInfo, newCardInfo]);

        if (window.localStorage.getItem('cardListInfo')) {
            let currentStorage = JSON.parse(window.localStorage.getItem('cardListInfo'));

            currentStorage.push(newCardInfo);

            window.localStorage.setItem('cardListInfo', JSON.stringify(currentStorage));    
        }
        else {
            let tempArray = [];
            tempArray.push(newCardInfo);
            window.localStorage.setItem('cardListInfo', JSON.stringify(tempArray)); 
        }
    };

    return (
        <div>
            <Link to="/">{<NavButton></NavButton>}</Link>
            <Link to="/twoteam">{<Button className="mt-2 position-absolute start-50 translate-middle-x">Two Team Mode</Button>}</Link>
            <i id="addTeam" onClick={handleToggleModal} className="bi bi-plus-circle-fill position-absolute end-0"></i>

            <TeamBasedModal errorMsg={errorMessage} toggle={handleToggleModal} show={showModal} name={handleNameChange} addCard={addCardToList} title="Enter Team Name:"></TeamBasedModal>
        
            <div id="cardsContainer">
                <div id="team-container-row" className="row">
                    {
                        cardListInfo.map((item) => {
                            return (
                                <TeamBasedCard bgColor={item.bgColor} key={item.teamName} teamName={item.teamName} />
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}