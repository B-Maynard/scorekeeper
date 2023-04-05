import React, {useState, useEffect} from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function PointBasedStartingScoreModal(props) {

    // Modal for adding new teams in multi team mode
    // Passing functions from the multi team page here so that data can then be passed back (team name)

    return (
        <div>
                <Modal show={props.show} onHide={props.toggle}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter starting score for all players:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <input 
                            onChange={props.setStartingScore} 
                            value={props.startingScore}/>
                        </div>
                        <br />
                        <div className="row">
                            <input onChange={props.highToLowCheck} className="form-check-input text-center" type="checkbox" id="high-to-low-checkbox" checked={props.highToLowValue}/>
                            <label className="form-check-label" htmlFor="high-to-low-checkbox">
                                High to low scoring (Switch off if you want low to high)
                            </label>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.toggle}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={props.confirmScore}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
}






