import React, {useState, useEffect} from "react";
import "../css/TeamBased.css";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function TeamBasedModal(props) {

    // Modal for adding new teams in multi team mode
    // Passing functions from the multi team page here so that data can then be passed back (team name)

    return (
        <div>
                <Modal show={props.show} onHide={props.toggle}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Team Name:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input onChange={props.name}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.toggle}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={props.addCard}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
}






