import React, {useState, useEffect} from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function EditScoreModal(props) {

    // Modal for adding new teams in multi team mode
    // Passing functions from the multi team page here so that data can then be passed back (team name)

    return (
        <div>
                <Modal show={props.show} onHide={props.toggle}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Score Change:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    User: {props.userName}
                    <br></br>
                        <input 
                        onChange={props.setScoreChange} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.addScore}>
                            Add
                        </Button>
                        <Button variant="secondary" onClick={props.subtractScore}>
                            Subtract
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
}