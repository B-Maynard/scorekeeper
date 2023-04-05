import React, {useState, useEffect} from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PointBasedEndOfRoundRow from "./PointBasedEndOfRoundRow";

export default function EndRoundModal(props) {
    
    return (
        <div>
                <Modal show={props.show} onHide={props.toggle}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            props.userList.map((item, index) => {
                                return (
                                    <PointBasedEndOfRoundRow index={index} userName={item.userName}></PointBasedEndOfRoundRow>
                                );
                            })
                        }

                        <PointBasedEndOfRoundRow userName="Testing"></PointBasedEndOfRoundRow>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary">
                            Done
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
}