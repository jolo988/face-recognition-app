import React from "react";
import './FaceRecognition.css'

//Need to receive param from app.js
const FaceRecognition = ({ imageURL, box }) => {
    return (
        <div className='center'>
            <div className='absolute mt2'>
                <img id='inputimage' alt='' src={imageURL} width='500px' height='auto'/>
                <div className='bounding-box' stlye={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
            </div>
        </div>
    );
}
// empty div for bounding box to be drawn via css

export default FaceRecognition;