import React, {useState, useEffect} from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/PointBased.css';

export default function PointBasedEndOfRoundRow(props) {

    // Modal for adding new teams in multi team mode
    // Passing functions from the multi team page here so that data can then be passed back (team name)


    /*
    
        TODO: Need to assign the add/sub buttons different names depending on the index of the users. 
        we're passing in index now so we should be able to just use that somehow.

        Also need to actually flesh out the add/sub functionality
    
    
    */

    return (
        <div className="row">
            <div className="col-6">
                {props.userName}
            </div>
            <div className="col-2">
                <input id="score-update-input" type="number" />
            </div>
            <div className="col-2">
                <input type="radio" name="add-sub-radio" id="add-radio" checked/>
                <label for="add-radio">
                    Add
                </label>
            </div>
            <div className="col-2">
                <input type="radio" name="add-sub-radio" id="sub-radio"/>
                <label for="sub-radio">
                    Sub
                </label>
            </div>
        </div>
    );
}